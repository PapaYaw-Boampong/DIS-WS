import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";

import { recordAudit } from "../lib/audit";
import { prisma } from "../db";
import { verifyPassword } from "../lib/password";
import { toPublicUser } from "../lib/serialize";
import {
  createSession,
  getSessionUser,
  revokeSession,
} from "../lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    const user = await prisma.user.findUnique({ where: { email } });

    // Generic error for missing/inactive user or bad password (no enumeration).
    if (!user || user.status !== "ACTIVE") {
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
      await recordAudit(request, {
        actor: null,
        action: "auth.login_failed",
        targetType: "user",
        targetId: user.id,
        summary: `email=${email} reason=bad_password`,
      });
      return reply.code(401).send({ error: "invalid_credentials" });
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
