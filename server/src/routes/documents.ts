import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { requireRole, requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { resolveParent } from "../lib/current-parent";
import { deleteObject, getObjectBytes, uploadObject } from "../lib/storage";
import { prisma } from "../db";

const MAX_DOC_BYTES = 15 * 1024 * 1024;
const DOC_ADMIN = ["admin"] as const;

const docAudience = z.enum(["all", "parent", "staff", "student"]);
const docCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  category: z.string().min(1).default("policy"),
  audience: docAudience.default("all"),
  studentId: z.string().nullish(),
  downloadable: z.boolean().default(true),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataBase64: z.string().min(1),
});
const docUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  audience: docAudience.optional(),
  downloadable: z.boolean().optional(),
});

function contentTypeExt(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": "pdf",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
  };
  return map[mimeType.toLowerCase()] ?? "bin";
}

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

  // Any signed-in user: documents addressed to "all" or their role, plus (for
  // parents) receipts/bills tied to their own children.
  app.get("/me/documents", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent =
      actor.role === "parent" ? await resolveParent(actor.id) : null;

    const documents = await prisma.documentAsset.findMany({
      where: {
        OR: [
          { audience: "all" },
          { audience: actor.role },
          ...(parent ? [{ studentId: { in: parent.childIds } }] : []),
        ],
      },
      orderBy: { publishedAt: "desc" },
    });
    return reply.send({ documents });
  });

  // Admin uploads a document (file to R2) targeted at an audience.
  app.post("/documents", async (request, reply) => {
    const actor = await requireRole(request, reply, DOC_ADMIN);
    if (!actor) return;
    const parsed = docCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const bytes = Buffer.from(parsed.data.dataBase64, "base64");
    if (bytes.length === 0 || bytes.length > MAX_DOC_BYTES) {
      return reply.code(400).send({ error: "invalid_size" });
    }
    const objectKey = `documents/${randomUUID()}.${contentTypeExt(parsed.data.mimeType)}`;
    await uploadObject(objectKey, bytes, parsed.data.mimeType);

    const document = await prisma.documentAsset.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        audience: parsed.data.audience,
        studentId: parsed.data.studentId ?? null,
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        objectKey,
        downloadable: parsed.data.downloadable,
        uploadedById: actor.id,
        publishedAt: new Date().toISOString().slice(0, 10),
      },
    });
    await recordAudit(request, {
      actor,
      action: "documents.uploaded",
      targetType: "document",
      targetId: document.id,
      summary: `audience=${document.audience} file=${document.fileName}`,
    });
    return reply.code(201).send({ document });
  });

  app.patch("/documents/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, DOC_ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = docUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    try {
      const document = await prisma.documentAsset.update({
        where: { id },
        data: parsed.data,
      });
      await recordAudit(request, {
        actor,
        action: "documents.updated",
        targetType: "document",
        targetId: id,
        summary: Object.keys(parsed.data).join(","),
      });
      return reply.send({ document });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
  });

  app.delete("/documents/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, DOC_ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const existing = await prisma.documentAsset.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: "not_found" });
    await prisma.documentAsset.delete({ where: { id } });
    if (existing.objectKey) await deleteObject(existing.objectKey);
    await recordAudit(request, {
      actor,
      action: "documents.deleted",
      targetType: "document",
      targetId: id,
    });
    return reply.send({ ok: true });
  });

  // Streams a document's file after an audience/role check. Admin/accounts may
  // always download; others must match the audience (or be a parent of the
  // tied student) and the document must be downloadable.
  app.get("/documents/:id/download", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const doc = await prisma.documentAsset.findUnique({ where: { id } });
    if (!doc || !doc.objectKey) {
      return reply.code(404).send({ error: "not_found" });
    }

    const isStaffLevel = actor.role === "admin" || actor.role === "accounts";
    let allowed =
      isStaffLevel || doc.audience === "all" || doc.audience === actor.role;
    if (!allowed && doc.studentId && actor.role === "parent") {
      const parent = await resolveParent(actor.id);
      allowed = parent?.childIds.includes(doc.studentId) ?? false;
    }
    if (!allowed) return reply.code(403).send({ error: "forbidden" });
    if (!doc.downloadable && !isStaffLevel) {
      return reply.code(403).send({ error: "not_downloadable" });
    }

    const bytes = await getObjectBytes(doc.objectKey);
    if (!bytes) return reply.code(404).send({ error: "not_found" });
    return reply
      .header("content-type", doc.mimeType ?? "application/octet-stream")
      .header("content-disposition", `inline; filename="${doc.fileName ?? "document"}"`)
      .send(bytes);
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
