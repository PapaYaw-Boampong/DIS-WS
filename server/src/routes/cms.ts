import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { isContentIcon } from "../lib/content-icons";
import { prisma } from "../db";

// Public website CMS. Two audiences:
//   - Public (unauthenticated) read endpoints under /public/* serve only
//     `published` rows, for the marketing website to render.
//   - Admin-only write endpoints under /cms/* manage all rows (incl. drafts),
//     with an audit-log entry on every mutation.

const ADMIN = ["admin"] as const;

const iconField = z
  .string()
  .min(1)
  .refine(isContentIcon, { message: "unknown_icon" });

const statusField = z.enum(["draft", "published"]);

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// --- News ------------------------------------------------------------------

const newsBodySchema = z.array(
  z.object({
    heading: z.string().optional(),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
);

const newsCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(1),
  category: z.string().min(1).default("Updates"),
  icon: iconField.default("newspaper"),
  publishedLabel: z.string().min(1).default("School Notice"),
  imageDescription: z.string().default(""),
  body: newsBodySchema,
  status: statusField.default("draft"),
});

const newsUpdateSchema = newsCreateSchema.partial();

// --- Events ----------------------------------------------------------------

const eventCreateSchema = z.object({
  title: z.string().min(1),
  dateLabel: z.string().default(""),
  description: z.string().min(1),
  icon: iconField.default("calendar"),
  featured: z.boolean().default(false),
  status: statusField.default("draft"),
  position: z.number().int().default(0),
});

const eventUpdateSchema = eventCreateSchema.partial();

// --- Calendar terms --------------------------------------------------------

const calendarCreateSchema = z.object({
  name: z.string().min(1),
  period: z.string().default(""),
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).default([]),
  status: statusField.default("draft"),
  position: z.number().int().default(0),
});

const calendarUpdateSchema = calendarCreateSchema.partial();

export async function cmsRoutes(app: FastifyInstance): Promise<void> {
  // ---------------------------------------------------------------- public

  app.get("/public/news", async (_request, reply) => {
    const news = await prisma.newsArticlePost.findMany({
      where: { status: "published" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return reply.send({ news });
  });

  app.get("/public/news/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const article = await prisma.newsArticlePost.findFirst({
      where: { slug, status: "published" },
    });
    if (!article) return reply.code(404).send({ error: "not_found" });
    return reply.send({ article });
  });

  app.get("/public/events", async (_request, reply) => {
    const events = await prisma.eventPost.findMany({
      where: { status: "published" },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
    return reply.send({ events });
  });

  app.get("/public/calendar", async (_request, reply) => {
    const terms = await prisma.calendarTermPost.findMany({
      where: { status: "published" },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    return reply.send({ terms });
  });

  // ------------------------------------------------------------ admin: news

  app.get("/cms/news", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const news = await prisma.newsArticlePost.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return reply.send({ news });
  });

  app.post("/cms/news", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const parsed = newsCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const slug = slugify(parsed.data.slug ?? parsed.data.title);
    if (!slug) return reply.code(400).send({ error: "invalid_slug" });

    try {
      const article = await prisma.newsArticlePost.create({
        data: {
          slug,
          title: parsed.data.title,
          excerpt: parsed.data.excerpt,
          category: parsed.data.category,
          icon: parsed.data.icon,
          publishedLabel: parsed.data.publishedLabel,
          imageDescription: parsed.data.imageDescription,
          body: parsed.data.body,
          status: parsed.data.status,
          authorId: actor.id,
          publishedAt: parsed.data.status === "published" ? new Date() : null,
        },
      });
      await recordAudit(request, {
        actor,
        action: "cms.news_created",
        targetType: "news_post",
        targetId: article.id,
        summary: `slug=${slug} status=${parsed.data.status}`,
      });
      return reply.code(201).send({ article });
    } catch {
      return reply.code(409).send({ error: "slug_taken" });
    }
  });

  app.patch("/cms/news/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = newsUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const existing = await prisma.newsArticlePost.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ error: "not_found" });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.slug) data.slug = slugify(parsed.data.slug);
    // Set publishedAt the first time a post transitions to published.
    if (parsed.data.status === "published" && existing.status !== "published") {
      data.publishedAt = new Date();
    }

    try {
      const article = await prisma.newsArticlePost.update({ where: { id }, data });
      await recordAudit(request, {
        actor,
        action: "cms.news_updated",
        targetType: "news_post",
        targetId: id,
        summary: Object.keys(parsed.data).join(","),
      });
      return reply.send({ article });
    } catch {
      return reply.code(409).send({ error: "slug_taken" });
    }
  });

  app.delete("/cms/news/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    try {
      await prisma.newsArticlePost.delete({ where: { id } });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
    await recordAudit(request, {
      actor,
      action: "cms.news_deleted",
      targetType: "news_post",
      targetId: id,
    });
    return reply.send({ ok: true });
  });

  // ---------------------------------------------------------- admin: events

  app.get("/cms/events", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const events = await prisma.eventPost.findMany({
      orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    });
    return reply.send({ events });
  });

  app.post("/cms/events", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const parsed = eventCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const event = await prisma.eventPost.create({
      data: { ...parsed.data, authorId: actor.id },
    });
    await recordAudit(request, {
      actor,
      action: "cms.event_created",
      targetType: "event_post",
      targetId: event.id,
      summary: `title=${event.title} status=${event.status}`,
    });
    return reply.code(201).send({ event });
  });

  app.patch("/cms/events/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = eventUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    try {
      const event = await prisma.eventPost.update({
        where: { id },
        data: parsed.data,
      });
      await recordAudit(request, {
        actor,
        action: "cms.event_updated",
        targetType: "event_post",
        targetId: id,
        summary: Object.keys(parsed.data).join(","),
      });
      return reply.send({ event });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
  });

  app.delete("/cms/events/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    try {
      await prisma.eventPost.delete({ where: { id } });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
    await recordAudit(request, {
      actor,
      action: "cms.event_deleted",
      targetType: "event_post",
      targetId: id,
    });
    return reply.send({ ok: true });
  });

  // -------------------------------------------------------- admin: calendar

  app.get("/cms/calendar", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const terms = await prisma.calendarTermPost.findMany({
      orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    });
    return reply.send({ terms });
  });

  app.post("/cms/calendar", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const parsed = calendarCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const term = await prisma.calendarTermPost.create({
      data: { ...parsed.data, authorId: actor.id },
    });
    await recordAudit(request, {
      actor,
      action: "cms.calendar_created",
      targetType: "calendar_term",
      targetId: term.id,
      summary: `name=${term.name} status=${term.status}`,
    });
    return reply.code(201).send({ term });
  });

  app.patch("/cms/calendar/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = calendarUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    try {
      const term = await prisma.calendarTermPost.update({
        where: { id },
        data: parsed.data,
      });
      await recordAudit(request, {
        actor,
        action: "cms.calendar_updated",
        targetType: "calendar_term",
        targetId: id,
        summary: Object.keys(parsed.data).join(","),
      });
      return reply.send({ term });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
  });

  app.delete("/cms/calendar/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    try {
      await prisma.calendarTermPost.delete({ where: { id } });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
    await recordAudit(request, {
      actor,
      action: "cms.calendar_deleted",
      targetType: "calendar_term",
      targetId: id,
    });
    return reply.send({ ok: true });
  });
}
