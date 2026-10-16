import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

import { recordAudit } from "../lib/audit";
import { prisma } from "../db";
import { createMfaChallenge, redeemMfaChallenge } from "../lib/mfa";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  checkLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from "../lib/rate-limit";
import { toPublicUser } from "../lib/serialize";
import {
  createSession,
  getSessionUser,
  revokeAllUserSessions,
  revokeSession,
} from "../lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const mfaVerifySchema = z.object({
  challengeToken: z.string().min(1),
  // Wide enough for BOTH factors this endpoint accepts: a 6-digit TOTP code
  // and an 11-character backup code ("A1B2C-3D4E5"). Sizing this to the TOTP
  // code alone silently makes every backup code unusable — which nobody finds
  // out until they have already lost their phone.
  code: z.string().min(6).max(32),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

function bearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // No public sign-up: accounts are admin-issued. This only authenticates them.
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const email = parsed.data.email.toLowerCase();
    const ip = request.ip;

    // Throttle before touching the database or hashing anything: a locked-out
    // key must cost an attacker a cheap 429, not an argon2 verification.
    const throttle = checkLoginAllowed(email, ip);
    if (!throttle.allowed) {
      await recordAudit(request, {
        actor: null,
        action: "auth.login_throttled",
        targetType: "user",
        summary: `email=${email} retryAfter=${throttle.retryAfterSeconds}s`,
      });
      return reply
        .code(429)
        .header("retry-after", String(throttle.retryAfterSeconds))
        .send({
          error: "too_many_attempts",
          retryAfterSeconds: throttle.retryAfterSeconds,
        });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic error for missing/inactive user or bad password (no enumeration).
    if (!user || user.status !== "ACTIVE") {
      recordLoginFailure(email, ip);
      await recordAudit(request, {
        actor: null,
        action: "auth.login_failed",
        targetType: "user",
        targetId: user?.id ?? null,
        summary: `email=${email} reason=${!user ? "not_found" : "inactive"}`,
      });
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const passwordOk = await verifyPassword(user.passwordHash, parsed.data.password);
    if (!passwordOk) {
      recordLoginFailure(email, ip);
      await recordAudit(request, {
        actor: null,
        action: "auth.login_failed",
        targetType: "user",
        targetId: user.id,
        summary: `email=${email} reason=bad_password`,
      });
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    clearLoginFailures(email);

    // Password is right, but it is only the first factor. Hand back a
    // short-lived challenge, NOT a session — nothing is signed in until the
    // code is redeemed.
    if (user.mfaEnabledAt) {
      const challenge = await createMfaChallenge(user.id);
      await recordAudit(request, {
        actor: toPublicUser(user),
        action: "auth.mfa_challenge_issued",
        targetType: "user",
        targetId: user.id,
      });
      return reply.send({
        mfaRequired: true,
        challengeToken: challenge.challengeToken,
        expiresAt: challenge.expiresAt.toISOString(),
      });
    }

    const { token, expiresAt } = await createSession(user.id, {
      userAgent: request.headers["user-agent"],
    });

    await recordAudit(request, {
      actor: toPublicUser(user),
      action: "auth.login_succeeded",
      targetType: "user",
      targetId: user.id,
    });

    return reply.send({
      token,
      expiresAt: expiresAt.toISOString(),
      user: toPublicUser(user),
    });
  });

  // Second step of a two-factor sign-in: redeem the challenge for a session.
  app.post("/auth/mfa/verify", async (request, reply) => {
    const parsed = mfaVerifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const result = await redeemMfaChallenge(
      parsed.data.challengeToken,
      parsed.data.code,
    );

    if (!result.ok) {
      await recordAudit(request, {
        actor: null,
        action: "auth.mfa_failed",
        targetType: "user",
        summary: `reason=${result.reason}`,
      });
      const status = result.reason === "invalid_code" ? 401 : 400;
      return reply.code(status).send({ error: result.reason });
    }

    const { token, expiresAt } = await createSession(result.user.id, {
      userAgent: request.headers["user-agent"],
    });

    await recordAudit(request, {
      actor: toPublicUser(result.user),
      action: "auth.login_succeeded",
      targetType: "user",
      targetId: result.user.id,
      summary: "second factor verified",
    });

    return reply.send({
      token,
      expiresAt: expiresAt.toISOString(),
      user: toPublicUser(result.user),
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const token = bearerToken(request);
    if (!token) {
      return reply.code(401).send({ error: "unauthenticated" });
    }

    const user = await getSessionUser(token);
    if (!user) {
      return reply.code(401).send({ error: "unauthenticated" });
    }

    return reply.send({ user: toPublicUser(user) });
  });

  // Signed-in user changes their own password (also clears the forced-change
  // flag). Revokes other sessions, then issues a fresh session for this client.
  app.post("/auth/change-password", async (request, reply) => {
    const token = bearerToken(request);
    if (!token) {
      return reply.code(401).send({ error: "unauthenticated" });
    }
    const user = await getSessionUser(token);
    if (!user) {
      return reply.code(401).send({ error: "unauthenticated" });
    }
    const parsed = changePasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const currentOk = await verifyPassword(
      user.passwordHash,
      parsed.data.currentPassword,
    );
    if (!currentOk) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }
    if (parsed.data.newPassword === parsed.data.currentPassword) {
      return reply.code(400).send({ error: "password_unchanged" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.data.newPassword),
        mustChangePassword: false,
      },
    });
    // Invalidate all sessions (including this one), then re-issue for the client.
    await revokeAllUserSessions(user.id);
    const { token: newToken, expiresAt } = await createSession(user.id, {
      userAgent: request.headers["user-agent"],
    });

    await recordAudit(request, {
      actor: toPublicUser(user),
      action: "auth.password_changed",
      targetType: "user",
      targetId: user.id,
    });

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    return reply.send({
      token: newToken,
      expiresAt: expiresAt.toISOString(),
      user: updated ? toPublicUser(updated) : toPublicUser(user),
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    const token = bearerToken(request);
    if (token) {
      const user = await getSessionUser(token);
      await revokeSession(token);
      if (user) {
        await recordAudit(request, {
          actor: toPublicUser(user),
          action: "auth.logout",
          targetType: "session",
          targetId: user.id,
        });
      }
    }
    return reply.code(204).send();
  });
}
