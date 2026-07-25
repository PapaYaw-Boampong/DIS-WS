import type { FastifyInstance } from "fastify";

import { requireUser } from "../lib/auth-guard";
import { prisma } from "../db";

export async function communicationRoutes(app: FastifyInstance): Promise<void> {
  app.get("/announcements", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      announcements: await prisma.announcement.findMany({
        orderBy: { publishedAt: "desc" },
      }),
    });
  });

  app.get("/events", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      events: await prisma.portalEventRecord.findMany({
        orderBy: { date: "asc" },
      }),
    });
  });

  app.get("/transport-notices", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      notices: await prisma.transportNoticeRecord.findMany({
        orderBy: { publishedAt: "desc" },
      }),
    });
  });
}
