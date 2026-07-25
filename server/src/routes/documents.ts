import type { FastifyInstance } from "fastify";

import { requireRole, requireUser } from "../lib/auth-guard";
import { resolveParent } from "../lib/current-parent";
import { prisma } from "../db";

// Increment 6: documents + notifications.
export async function documentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/documents", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin", "accounts"]);
    if (!actor) return;
    const documents = await prisma.documentAsset.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return reply.send({ documents });
  });

  // Parent: documents addressed to parents/all, plus receipts/bills for their
  // own children.
  app.get("/me/documents", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);

    const documents = await prisma.documentAsset.findMany({
      where: {
        OR: [
          { audience: "all" },
          { audience: "parent" },
          ...(parent ? [{ studentId: { in: parent.childIds } }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
    return reply.send({ documents });
  });

  app.get("/me/notifications", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ audience: "all" }, { audience: actor.role }, { userId: actor.id }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const reads = await prisma.notificationRead.findMany({
      where: {
        userId: actor.id,
        notificationId: { in: notifications.map((item) => item.id) },
      },
      select: { notificationId: true },
    });
    const readSet = new Set(reads.map((row) => row.notificationId));

    // `read` is per-user, derived from NotificationRead (not the row's column).
    return reply.send({
      notifications: notifications.map((item) => ({
        ...item,
        read: readSet.has(item.id),
      })),
    });
  });

  // Mark one notification read/unread for the current user.
  app.post("/me/notifications/:id/read", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [{ audience: "all" }, { audience: actor.role }, { userId: actor.id }],
      },
      select: { id: true },
    });
    if (!notification) {
      return reply.code(404).send({ error: "not_found" });
    }

    const read = (request.body as { read?: boolean } | undefined)?.read !== false;
    if (read) {
      await prisma.notificationRead.upsert({
        where: { notificationId_userId: { notificationId: id, userId: actor.id } },
        create: { notificationId: id, userId: actor.id },
        update: {},
      });
    } else {
      await prisma.notificationRead.deleteMany({
        where: { notificationId: id, userId: actor.id },
      });
    }

    return reply.send({ ok: true });
  });

  // Mark all of the user's visible notifications read.
  app.post("/me/notifications/read-all", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ audience: "all" }, { audience: actor.role }, { userId: actor.id }],
      },
      select: { id: true },
    });
    await prisma.notificationRead.createMany({
      data: notifications.map((item) => ({
        notificationId: item.id,
        userId: actor.id,
      })),
      skipDuplicates: true,
    });

    return reply.send({ ok: true });
  });
}
