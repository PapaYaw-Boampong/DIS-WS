import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import type { User } from "@prisma/client";

import { prisma } from "../db";
import { hashToken } from "./session";
import { generateBackupCodes, verifyCode } from "./totp";

// Second-factor plumbing: the short-lived login challenge, and one-time backup
// codes. The TOTP arithmetic itself lives in ./totp.

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
// A 6-digit code has a million possibilities, but only ~90 seconds of validity
// and unlimited guesses would be enough. Five attempts kills the challenge.
const MAX_CHALLENGE_ATTEMPTS = 5;

export function isMfaEnabled(user: Pick<User, "mfaEnabledAt">): boolean {
  return user.mfaEnabledAt !== null;
}

export async function createMfaChallenge(
  userId: string,
): Promise<{ challengeToken: string; expiresAt: Date }> {
  // Only one challenge outstanding per user: starting a fresh sign-in should
  // invalidate an abandoned one rather than leave several valid tickets.
  await prisma.mfaChallenge.deleteMany({ where: { userId } });

  const challengeToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS);

  await prisma.mfaChallenge.create({
    data: { tokenHash: hashToken(challengeToken), userId, expiresAt },
  });

  return { challengeToken, expiresAt };
}

export type ChallengeResult =
  | { ok: true; user: User }
  | { ok: false; reason: "invalid_challenge" | "expired" | "too_many_attempts" | "invalid_code" };

/**
 * Redeem a challenge with a TOTP code or a backup code. On success the
 * challenge is consumed, so one ticket buys exactly one session.
 */
export async function redeemMfaChallenge(
  challengeToken: string,
  submittedCode: string,
): Promise<ChallengeResult> {
  const challenge = await prisma.mfaChallenge.findUnique({
    where: { tokenHash: hashToken(challengeToken) },
    include: { user: true },
  });

  if (!challenge) return { ok: false, reason: "invalid_challenge" };

  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: false, reason: "expired" };
  }

  if (challenge.attempts >= MAX_CHALLENGE_ATTEMPTS) {
    await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: false, reason: "too_many_attempts" };
  }

  const user = challenge.user;
  if (!user.mfaSecret || !user.mfaEnabledAt) {
    // MFA was turned off between issuing and redeeming the challenge.
    await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: false, reason: "invalid_challenge" };
  }

  const counter = verifyCode(user.mfaSecret, submittedCode);

  if (counter !== null) {
    // Reject a code being replayed within its own 30-second step.
    if (
      user.mfaLastUsedCounter !== null &&
      BigInt(counter) <= user.mfaLastUsedCounter
    ) {
      await prisma.mfaChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      return { ok: false, reason: "invalid_code" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaLastUsedCounter: BigInt(counter) },
    });
    await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: true, user };
  }

  if (await consumeBackupCode(user.id, submittedCode)) {
    await prisma.mfaChallenge.delete({ where: { id: challenge.id } }).catch(() => undefined);
    return { ok: true, user };
  }

  await prisma.mfaChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
  });
  return { ok: false, reason: "invalid_code" };
}

function hashBackupCode(code: string): string {
  return createHash("sha256")
    .update(code.replace(/[\s-]/g, "").toUpperCase())
    .digest("hex");
}

/** Replaces any existing codes. Returns the plaintext — shown once, never again. */
export async function issueBackupCodes(userId: string): Promise<string[]> {
  const codes = generateBackupCodes();

  await prisma.mfaBackupCode.deleteMany({ where: { userId } });
  await prisma.mfaBackupCode.createMany({
    data: codes.map((code) => ({ userId, codeHash: hashBackupCode(code) })),
  });

  return codes;
}

// Marks a matching unused code as used. Comparison is timing-safe and runs
// over every candidate so a match cannot be spotted by how long it took.
export async function consumeBackupCode(
  userId: string,
  submitted: string,
): Promise<boolean> {
  const normalised = submitted.replace(/[\s-]/g, "").toUpperCase();
  if (!/^[0-9A-F]{10}$/.test(normalised)) return false;

  const target = Buffer.from(hashBackupCode(normalised), "utf8");
  const codes = await prisma.mfaBackupCode.findMany({
    where: { userId, usedAt: null },
  });

  let matchedId: string | null = null;
  for (const code of codes) {
    const candidate = Buffer.from(code.codeHash, "utf8");
    if (
      candidate.length === target.length &&
      timingSafeEqual(candidate, target)
    ) {
      matchedId = code.id;
    }
  }

  if (!matchedId) return false;

  await prisma.mfaBackupCode.update({
    where: { id: matchedId },
    data: { usedAt: new Date() },
  });
  return true;
}

export async function countUnusedBackupCodes(userId: string): Promise<number> {
  return prisma.mfaBackupCode.count({ where: { userId, usedAt: null } });
}

export const mfaConfig = {
  challengeTtlMs: CHALLENGE_TTL_MS,
  maxChallengeAttempts: MAX_CHALLENGE_ATTEMPTS,
} as const;
