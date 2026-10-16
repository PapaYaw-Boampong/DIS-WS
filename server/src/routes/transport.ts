import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole, requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { requireCapability } from "../lib/capabilities";
import { resolveParent } from "../lib/current-parent";
import { notify } from "../lib/payments";
import { prisma } from "../db";

// Position shared from the driver's phone. Bounds are enforced so a bad fix
// cannot drop a bus in the sea, and accuracy is carried through so the parent
// view can say how precise the reading actually is.
const positionSchema = z.object({
  routeId: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKph: z.number().min(0).max(300).optional(),
  accuracyM: z.number().min(0).max(100_000).optional(),
  direction: z.string().optional(),
  recordedAt: z.string().optional(),
});

const tripStatusSchema = z.object({
  routeId: z.string().min(1),
  status: z.string().min(1),
  nextStop: z.string().optional().default(""),
  direction: z.string().optional().default("morning"),
  date: z.string().optional().default(""),
  notifyParents: z.boolean().optional().default(false),
});

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

  // Record a trip's live status. One trip row per route+date+direction, so a
  // status update during a run overwrites that run rather than stacking a new
  // row every time the driver's position changes.
  app.post("/transport/trips", async (request, reply) => {
    const actor = await requireCapability(request, reply, "transport.manage");
    if (!actor) return;

    const parsed = tripStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const route = await prisma.transportRoute.findUnique({
      where: { id: parsed.data.routeId },
    });
    if (!route) return reply.code(404).send({ error: "route_not_found" });

    const date = parsed.data.date || new Date().toISOString().slice(0, 10);
    const lastUpdated = new Date().toISOString();

    const existing = await prisma.transportTrip.findFirst({
      where: {
        routeId: route.id,
        date,
        direction: parsed.data.direction,
      },
    });

    const trip = existing
      ? await prisma.transportTrip.update({
          where: { id: existing.id },
          data: {
            status: parsed.data.status,
            nextStop: parsed.data.nextStop || null,
            lastUpdated,
          },
        })
      : await prisma.transportTrip.create({
          data: {
            routeId: route.id,
            date,
            direction: parsed.data.direction,
            status: parsed.data.status,
            nextStop: parsed.data.nextStop || null,
            lastUpdated,
          },
        });

    // Only tell families when the operator asks — a status ping every few
    // minutes would make transport notifications worthless.
    if (parsed.data.notifyParents) {
      const assignments = await prisma.transportAssignment.findMany({
        where: { routeId: route.id },
      });
      const parents = await prisma.parent.findMany({
        where: {
          childIds: { hasSome: assignments.map((item) => item.studentId) },
        },
      });
      for (const parent of parents) {
        if (!parent.userId) continue;
        await notify({
          audience: "user",
          userId: parent.userId,
          title: `${route.routeName}: ${parsed.data.status}`,
          body: parsed.data.nextStop
            ? `${route.busName} is ${parsed.data.status}. Next stop: ${parsed.data.nextStop}.`
            : `${route.busName} is ${parsed.data.status}.`,
          priority: "important",
        });
      }
    }

    await recordAudit(request, {
      actor,
      action: "transport.trip_updated",
      targetType: "transport_trip",
      targetId: trip.id,
      summary: `route=${route.routeName} status=${trip.status} nextStop=${trip.nextStop ?? "-"} notified=${parsed.data.notifyParents}`,
    });

    return reply.code(201).send({ trip });
  });

  // --- Driver position sharing -------------------------------------------
  // The bus does not carry a tracker: the driver signs in on their phone and
  // shares location while they are on the run. So position is authenticated as
  // the driver, and a driver can only move the route they are assigned to.

  // The routes this driver is allowed to share position for. Drives the route
  // picker on their phone.
  app.get("/me/transport/routes", async (request, reply) => {
    const actor = await requireCapability(request, reply, "transport.manage");
    if (!actor) return;

    // A named driver sees only their own route(s). Anyone running transport
    // for the school (admin, transport office) can cover any route — buses get
    // swapped and relief drivers happen.
    const own = await prisma.transportRoute.findMany({
      where: { driverUserId: actor.id },
      orderBy: { routeName: "asc" },
    });

    const routes =
      own.length > 0
        ? own
        : await prisma.transportRoute.findMany({ orderBy: { routeName: "asc" } });

    return reply.send({
      routes: routes.map((route) => ({
        id: route.id,
        routeName: route.routeName,
        busName: route.busName,
        assignedToMe: route.driverUserId === actor.id,
      })),
    });
  });

  app.post("/me/transport/position", async (request, reply) => {
    const actor = await requireCapability(request, reply, "transport.manage");
    if (!actor) return;

    const parsed = positionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const route = await prisma.transportRoute.findUnique({
      where: { id: parsed.data.routeId },
    });
    if (!route) return reply.code(404).send({ error: "route_not_found" });

    // If the route has a named driver, only that driver or an admin may move
    // it — otherwise any transport account could post a position for a bus
    // they are nowhere near.
    if (
      route.driverUserId &&
      route.driverUserId !== actor.id &&
      actor.role !== "admin"
    ) {
      return reply.code(403).send({ error: "not_your_route" });
    }

    const date = new Date().toISOString().slice(0, 10);
    const direction = parsed.data.direction ?? "morning";
    const positionAt = parsed.data.recordedAt
      ? new Date(parsed.data.recordedAt)
      : new Date();

    if (Number.isNaN(positionAt.getTime())) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const position = {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      speedKph: parsed.data.speedKph ?? null,
      accuracyM: parsed.data.accuracyM ?? null,
      positionAt,
      positionById: actor.id,
      lastUpdated: new Date().toISOString(),
    };

    // Sharing a position says where the bus is; it does not decide the trip's
    // operational status. A run marked cancelled must not be un-cancelled by a
    // phone still reporting from the yard.
    const existing = await prisma.transportTrip.findFirst({
      where: { routeId: route.id, date, direction },
    });

    const trip = existing
      ? await prisma.transportTrip.update({
          where: { id: existing.id },
          data: position,
        })
      : await prisma.transportTrip.create({
          data: {
            routeId: route.id,
            date,
            direction,
            status: "on_route",
            nextStop: null,
            ...position,
          },
        });

    // Deliberately NOT audited: a phone reports every few seconds and would
    // bury every human action in the audit log.
    return reply.send({
      tripId: trip.id,
      recordedAt: positionAt.toISOString(),
    });
  });

  // Stop sharing. Clears the live fix immediately rather than letting it go
  // stale on the parent's screen for five minutes after the run ends.
  app.post("/me/transport/position/stop", async (request, reply) => {
    const actor = await requireCapability(request, reply, "transport.manage");
    if (!actor) return;

    const routeId = (request.body as { routeId?: string } | undefined)?.routeId;
    if (!routeId) return reply.code(400).send({ error: "invalid_request" });

    const date = new Date().toISOString().slice(0, 10);
    await prisma.transportTrip.updateMany({
      where: { routeId, date, positionById: actor.id },
      data: {
        latitude: null,
        longitude: null,
        speedKph: null,
        accuracyM: null,
        positionAt: null,
        positionById: null,
        lastUpdated: new Date().toISOString(),
      },
    });

    return reply.send({ stopped: true });
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
