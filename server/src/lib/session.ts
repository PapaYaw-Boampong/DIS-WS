import { createHash, randomBytes } from "node:crypto";

import type { User } from "@prisma/client";

import { prisma } from "../db";

// Server-owned sessions: an opaque token is returned to the caller, but only its
// SHA-256 hash is stored, so a database leak cannot be replayed as a session.
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  meta?: { userAgent?: string | undefined },
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
      userAgent: meta?.userAgent ?? null,
    },
  });

  return { token, expiresAt };
}

export async function getSessionUser(token: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session
      .delete({ where: { id: session.id } })
      .catch(() => undefined);
    return null;
  }

  if (session.user.status !== "ACTIVE") {
    return null;
  }

  return session.user;
}

export async function revokeSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

// Invalidates every active session for a user (used on password reset/change so
// old credentials can't keep a session alive).
export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
