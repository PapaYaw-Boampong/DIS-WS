import type { FastifyInstance } from "fastify";

import { prisma } from "../db";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    ok: true,
    service: "dis-portal-api",
    time: new Date().toISOString(),
  }));

  // Readiness check that confirms the database is reachable.
  app.get("/health/db", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false, error: "database_unreachable" });
    }
  });
}
