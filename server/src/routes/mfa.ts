import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

import { recordAudit } from "../lib/audit";
import { requireCapability } from "../lib/capabilities";
import {
  countUnusedBackupCodes,
  issueBackupCodes,
} from "../lib/mfa";
import { verifyPassword } from "../lib/password";
import { toPublicUser } from "../lib/serialize";
import { getSessionUser, revokeAllUserSessions } from "../lib/session";
import { generateSecret, otpauthUri, verifyCode } from "../lib/totp";
import { prisma } from "../db";

const codeSchema = z.object({ code: z.string().min(6).max(9) });
const disableSchema = z.object({
  password: z.string().min(1),
  code: z.string().min(6).max(9),
});

const ISSUER = "Divine International School";

function bearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

// Second-factor enrolment and management for the signed-in user. Enabling and
// disabling MFA is always the account holder's own action — an admin can reset
// a password but must never be able to silently attach or remove someone's
// second factor.
export async function mfaRoutes(app: FastifyInstance): Promise<void> {
  async function currentUser(request: FastifyRequest) {
    const token = bearerToken(request);
    return token ? getSessionUser(token) : null;
  }

  app.get("/auth/mfa", async (request, reply) => {
    const user = await currentUser(request);
    if (!user) return reply.code(401).send({ error: "unauthenticated" });

    return reply.send({
      enabled: user.mfaEnabledAt !== null,
      enabledAt: user.mfaEnabledAt,
      backupCodesRemaining:
        user.mfaEnabledAt !== null ? await countUnusedBackupCodes(user.id) : 0,
    });
  });

  // Step 1 of enrolment: mint a secret and hand back the provisioning URI.
  // MFA is NOT active yet — the secret only counts once a code proves the
  // authenticator actually holds it.
  app.post("/auth/mfa/setup", async (request, reply) => {
    const user = await currentUser(request);
    if (!user) return reply.code(401).send({ error: "unauthenticated" });

    if (user.mfaEnabledAt) {
      return reply.code(409).send({ error: "already_enabled" });
    }

    const secret = generateSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret, mfaLastUsedCounter: null },
    });

    return reply.send({
      secret,
      otpauthUri: otpauthUri({
        secret,
        accountName: user.email,
        issuer: ISSUER,
      }),
    });
  });

  // Step 2: prove the authenticator works, then switch MFA on and hand over
  // the backup codes.
  app.post("/auth/mfa/enable", async (request, reply) => {
    const user = await currentUser(request);
    if (!user) return reply.code(401).send({ error: "unauthenticated" });

    if (user.mfaEnabledAt) {
      return reply.code(409).send({ error: "already_enabled" });
    }
    if (!user.mfaSecret) {
      return reply.code(400).send({ error: "setup_required" });
    }

    const parsed = codeSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });

    const counter = verifyCode(user.mfaSecret, parsed.data.code);
    if (counter === null) {
      return reply.code(400).send({ error: "invalid_code" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabledAt: new Date(), mfaLastUsedCounter: BigInt(counter) },
    });
    const backupCodes = await issueBackupCodes(user.id);

    await recordAudit(request, {
      actor: toPublicUser(user),
      action: "auth.mfa_enabled",
      targetType: "user",
      targetId: user.id,
    });

    return reply.send({ enabled: true, backupCodes });
  });

  // Turning MFA off needs BOTH the password and a current code: a hijacked
  // session alone must not be able to strip the second factor.
  app.post("/auth/mfa/disable", async (request, reply) => {
    const user = await currentUser(request);
    if (!user) return reply.code(401).send({ error: "unauthenticated" });
    if (!user.mfaEnabledAt || !user.mfaSecret) {
      return reply.code(409).send({ error: "not_enabled" });
    }

    const parsed = disableSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });

    if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }
    if (verifyCode(user.mfaSecret, parsed.data.code) === null) {
      return reply.code(400).send({ error: "invalid_code" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: null, mfaEnabledAt: null, mfaLastUsedCounter: null },
    });
    await prisma.mfaBackupCode.deleteMany({ where: { userId: user.id } });
    await prisma.mfaChallenge.deleteMany({ where: { userId: user.id } });

    await recordAudit(request, {
      actor: toPublicUser(user),
      action: "auth.mfa_disabled",
      targetType: "user",
      targetId: user.id,
    });

    return reply.send({ enabled: false });
  });

  // Fresh backup codes, invalidating the old set. Requires a current code, so
  // it cannot be done from a stolen session.
  app.post("/auth/mfa/backup-codes", async (request, reply) => {
    const user = await currentUser(request);
    if (!user) return reply.code(401).send({ error: "unauthenticated" });
    if (!user.mfaEnabledAt || !user.mfaSecret) {
      return reply.code(409).send({ error: "not_enabled" });
    }

    const parsed = codeSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "invalid_request" });
    if (verifyCode(user.mfaSecret, parsed.data.code) === null) {
      return reply.code(400).send({ error: "invalid_code" });
    }

    const backupCodes = await issueBackupCodes(user.id);
    await recordAudit(request, {
      actor: toPublicUser(user),
      action: "auth.mfa_backup_codes_regenerated",
      targetType: "user",
      targetId: user.id,
    });

    return reply.send({ backupCodes });
  });

  // Emergency lockout recovery: an account manager clears the second factor
  // for someone who lost their phone AND their backup codes. Heavily audited,
  // and it revokes their sessions so the reset cannot be used to ride an
  // existing login.
  app.post<{ Params: { id: string } }>(
    "/admin/users/:id/reset-mfa",
    async (request, reply) => {
      const actor = await requireCapability(request, reply, "accounts.manage");
      if (!actor) return;

      const target = await prisma.user.findUnique({
        where: { id: request.params.id },
      });
      if (!target) return reply.code(404).send({ error: "not_found" });
      if (!target.mfaEnabledAt) {
        return reply.code(409).send({ error: "not_enabled" });
      }

      await prisma.user.update({
        where: { id: target.id },
        data: { mfaSecret: null, mfaEnabledAt: null, mfaLastUsedCounter: null },
      });
      await prisma.mfaBackupCode.deleteMany({ where: { userId: target.id } });
      await prisma.mfaChallenge.deleteMany({ where: { userId: target.id } });
      await revokeAllUserSessions(target.id);

      await recordAudit(request, {
        actor,
        action: "admin.mfa_reset",
        targetType: "user",
        targetId: target.id,
        summary: `email=${target.email}`,
      });

      return reply.send({ enabled: false });
    },
  );
}
