import type { FastifyInstance } from "fastify";

import { requireRole } from "../lib/auth-guard";
import { prisma } from "../db";

// Admin-only read of the append-only audit trail (no update/delete route).
export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.get("/audit-logs", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin"]);
    if (!actor) return;

    const query = request.query as {
      page?: string;
      pageSize?: string;
      actorId?: string;
      targetType?: string;
      action?: string;
    };
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
    const where = {
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.targetType ? { targetType: query.targetType } : {}),
      ...(query.action ? { action: query.action } : {}),
    };

    const [items, totalItems] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return reply.send({
      items,
      pageInfo: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    });
  });
}
