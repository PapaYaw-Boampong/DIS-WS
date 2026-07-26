import type { FastifyInstance } from "fastify";

import { requireRole, requireUser } from "../lib/auth-guard";
import { resolveParent } from "../lib/current-parent";
import { prisma } from "../db";

// Increment 5: transport routes, trips, and the parent's assigned transport.
export async function transportRoutes(app: FastifyInstance): Promise<void> {
  app.get("/transport/routes", async (request, reply) => {
    const actor = await requireRole(request, reply, [
      "admin",
      "transport",
      "accounts",
    ]);
    if (!actor) return;
    const routes = await prisma.transportRoute.findMany({
      orderBy: { routeName: "asc" },
    });
    return reply.send({ routes });
  });

  app.get("/transport/trips", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin", "transport"]);
    if (!actor) return;
    const trips = await prisma.transportTrip.findMany({
      orderBy: { lastUpdated: "desc" },
    });
    return reply.send({ trips });
  });

  app.get("/transport/assignments", async (request, reply) => {
    const actor = await requireRole(request, reply, [
      "admin",
      "transport",
      "accounts",
    ]);
    if (!actor) return;
    const assignments = await prisma.transportAssignment.findMany();
    return reply.send({ assignments });
  });

  // Parent: the transport assignment(s) for their children, with route + latest
  // trip for each.
  app.get("/me/transport", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);
    if (!parent) return reply.send({ assignments: [] });

    const assignments = await prisma.transportAssignment.findMany({
      where: { studentId: { in: parent.childIds } },
    });

    const detailed = await Promise.all(
      assignments.map(async (assignment) => {
        const [student, route, latestTrip] = await Promise.all([
          prisma.student.findUnique({ where: { id: assignment.studentId } }),
          prisma.transportRoute.findUnique({ where: { id: assignment.routeId } }),
          prisma.transportTrip.findFirst({
            where: { routeId: assignment.routeId },
            orderBy: { lastUpdated: "desc" },
          }),
        ]);
        return { assignment, student, route, latestTrip };
      }),
    );

    return reply.send({ assignments: detailed });
  });
}
