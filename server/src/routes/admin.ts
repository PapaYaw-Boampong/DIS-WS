import type { FastifyInstance } from "fastify";
import type { Role, UserStatus } from "@prisma/client";
import { z } from "zod";

import { requireRole } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { toPublicUser } from "../lib/serialize";
import { prisma } from "../db";
import { hashPassword } from "../lib/password";

const lowerRoles = [
  "student",
  "parent",
  "staff",
  "admin",
  "accounts",
  "transport",
] as const;

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(lowerRoles),
  password: z.string().min(8),
});

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  role: z.enum(lowerRoles).optional(),
});

const toRole = (value: string): Role => value.toUpperCase() as Role;
const toStatus = (value: string): UserStatus => value.toUpperCase() as UserStatus;

// Increment 2: admin-issued account lifecycle (no public sign-up).
export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.get("/admin/users", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin"]);
    if (!actor) return;

    const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    return reply.send({ users: users.map(toPublicUser) });
  });

  app.post("/admin/users", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin"]);
    if (!actor) return;

    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ error: "email_taken" });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        role: toRole(parsed.data.role),
        passwordHash,
      },
    });

    await recordAudit(request, {
      actor,
      action: "admin.account_created",
      targetType: "user",
      targetId: user.id,
      summary: `role=${parsed.data.role} email=${email}`,
    });

    return reply.code(201).send({ user: toPublicUser(user) });
  });

  app.patch<{ Params: { id: string } }>(
    "/admin/users/:id",
    async (request, reply) => {
      const actor = await requireRole(request, reply, ["admin"]);
      if (!actor) return;

      const parsed = patchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_request" });
      }

      const data: {
        name?: string;
        status?: UserStatus;
        role?: Role;
      } = {};
      if (parsed.data.name) data.name = parsed.data.name;
      if (parsed.data.status) data.status = toStatus(parsed.data.status);
      if (parsed.data.role) data.role = toRole(parsed.data.role);

      try {
        const before = await prisma.user.findUnique({
          where: { id: request.params.id },
        });
        const user = await prisma.user.update({
          where: { id: request.params.id },
          data,
        });
        const changes = Object.entries(data)
          .map(
            ([key, value]) =>
              `${key}: ${String(before?.[key as keyof typeof before])} -> ${String(value)}`,
          )
          .join(", ");
        await recordAudit(request, {
          actor,
          action: "admin.account_updated",
          targetType: "user",
          targetId: user.id,
          summary: changes || undefined,
        });
        return reply.send({ user: toPublicUser(user) });
      } catch {
        return reply.code(404).send({ error: "not_found" });
      }
    },
  );
}
