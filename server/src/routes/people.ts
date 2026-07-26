import type { FastifyInstance } from "fastify";

import { requireRole, requireUser } from "../lib/auth-guard";
import { resolveParent } from "../lib/current-parent";
import { prisma } from "../db";

// Increment 3: identity / people directory.
export async function peopleRoutes(app: FastifyInstance): Promise<void> {
  app.get("/students", async (request, reply) => {
    const actor = await requireRole(request, reply, [
      "admin",
      "staff",
      "accounts",
    ]);
    if (!actor) return;
    const students = await prisma.student.findMany({
      orderBy: { fullName: "asc" },
    });
    return reply.send({ students });
  });

  app.get("/parents", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin", "accounts"]);
    if (!actor) return;
    const parents = await prisma.parent.findMany({
      orderBy: { fullName: "asc" },
    });
    return reply.send({ parents });
  });

  app.get("/staff", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin"]);
    if (!actor) return;
    const staff = await prisma.staff.findMany({ orderBy: { fullName: "asc" } });
    return reply.send({ staff });
  });

  app.get("/classes", async (request, reply) => {
    const actor = await requireRole(request, reply, [
      "admin",
      "staff",
      "accounts",
    ]);
    if (!actor) return;
    const classes = await prisma.schoolClass.findMany({
      orderBy: { name: "asc" },
    });
    return reply.send({ classes });
  });

  // Staff member's own record (classIds/subjectIds), for staff pages.
  app.get("/me/staff", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const staff = await prisma.staff.findFirst({ where: { userId: actor.id } });
    return reply.send({ staff });
  });

  // Parent's own children.
  app.get("/me/children", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const parent = await resolveParent(actor.id);
    if (!parent) {
      return reply.send({ parent: null, children: [] });
    }

    const children = await prisma.student.findMany({
      where: { id: { in: parent.childIds } },
      orderBy: { fullName: "asc" },
    });
    return reply.send({ parent, children });
  });
}
