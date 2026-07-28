import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { prisma } from "../db";

const ADMIN = ["admin"] as const;

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(120).default(""),
  consent: z.boolean().default(true),
});

const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(60).default(""),
  subject: z.string().max(200).default(""),
  message: z.string().min(1).max(5000),
  type: z.enum(["contact", "admissions"]).default("contact"),
});

// Public form capture (mailing list + inquiries) and admin management of both.
export async function formsRoutes(app: FastifyInstance): Promise<void> {
  // ---------------------------------------------------------------- public

  app.post("/public/mailing-list", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const email = parsed.data.email.toLowerCase();
    // Upsert: a re-signup reactivates an unsubscribed address rather than 409.
    await prisma.mailingListSignup.upsert({
      where: { email },
      create: {
        email,
        firstName: parsed.data.firstName,
        consent: parsed.data.consent,
        status: "active",
      },
      update: { status: "active", firstName: parsed.data.firstName || undefined },
    });
    return reply.code(201).send({ ok: true });
  });

  app.post("/public/inquiries", async (request, reply) => {
    const parsed = inquirySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const inquiry = await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
        type: parsed.data.type,
      },
    });
    return reply.code(201).send({ ok: true, id: inquiry.id });
  });

  // ------------------------------------------------------------ admin: list

  app.get("/mailing-list", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const signups = await prisma.mailingListSignup.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ signups });
  });

  app.patch("/mailing-list/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = z
      .object({ status: z.enum(["active", "unsubscribed"]) })
      .safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    try {
      const signup = await prisma.mailingListSignup.update({
        where: { id },
        data: { status: parsed.data.status },
      });
      await recordAudit(request, {
        actor,
        action: "mailing_list.updated",
        targetType: "mailing_list_signup",
        targetId: id,
        summary: `status=${parsed.data.status}`,
      });
      return reply.send({ signup });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
  });

  app.get("/inquiries", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ inquiries });
  });

  app.patch("/inquiries/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ADMIN);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const parsed = z
      .object({
        status: z.enum(["new", "in_progress", "resolved"]).optional(),
        notes: z.string().max(5000).optional(),
      })
      .safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    try {
      const inquiry = await prisma.inquiry.update({
        where: { id },
        data: parsed.data,
      });
      await recordAudit(request, {
        actor,
        action: "inquiries.updated",
        targetType: "inquiry",
        targetId: id,
        summary: Object.keys(parsed.data).join(","),
      });
      return reply.send({ inquiry });
    } catch {
      return reply.code(404).send({ error: "not_found" });
    }
  });
}
