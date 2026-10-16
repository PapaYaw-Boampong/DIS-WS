import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { requireCapability } from "../lib/capabilities";
import { resolveParent } from "../lib/current-parent";
import { resolveStudent } from "../lib/current-student";
import { resolveReadableClassIds } from "../lib/current-staff";
import { notify } from "../lib/payments";
import { buildClassReportCards } from "../lib/report-cards";
import { prisma } from "../db";

const generateSchema = z.object({
  classId: z.string().min(1),
  academicYear: z.string().min(1),
  term: z.string().min(1),
});

const publishSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  publishedAt: z.string().optional(),
});

const patchSchema = z.object({
  classTeacherRemark: z.string().optional(),
  headTeacherRemark: z.string().optional(),
  nextTermBegins: z.string().optional(),
});

export async function reportCardRoutes(app: FastifyInstance): Promise<void> {
  // The publishing board. Scoped server-side the same way results/gradebook
  // are: a teacher sees only the classes they teach, admin sees everything.
  app.get("/report-cards", async (request, reply) => {
    const actor = await requireCapability(
      request,
      reply,
      "reportcards.publish",
    );
    if (!actor) return;

    const classIds = await resolveReadableClassIds(actor);
    const reportCards = await prisma.reportCard.findMany({
      where: classIds ? { classId: { in: classIds } } : undefined,
      orderBy: [{ academicYear: "desc" }, { term: "desc" }],
    });

    return reply.send({ reportCards });
  });

  // A family's own report cards. Only published rows ever leave this route —
  // a draft is the school's working copy, not a statement to the parent.
  app.get("/me/report-cards", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    let studentIds: string[] = [];

    const student = await resolveStudent(actor.id);
    if (student) {
      studentIds = [student.id];
    } else {
      const parent = await resolveParent(actor.id);
      studentIds = parent ? [...parent.childIds] : [];
    }

    if (studentIds.length === 0) {
      return reply.send({ reportCards: [] });
    }

    const reportCards = await prisma.reportCard.findMany({
      where: { studentId: { in: studentIds }, status: "published" },
      orderBy: [{ academicYear: "desc" }, { term: "desc" }],
    });

    return reply.send({ reportCards });
  });

  // Build (or refresh) drafts for a class from that class's gradebook.
  // A published card is never touched — correcting one means withdrawing it
  // first, which is a deliberate, audited act.
  app.post("/report-cards/generate", async (request, reply) => {
    const actor = await requireCapability(
      request,
      reply,
      "reportcards.publish",
    );
    if (!actor) return;

    const parsed = generateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const { classId, academicYear, term } = parsed.data;

    const readable = await resolveReadableClassIds(actor);
    if (readable && !readable.includes(classId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const drafts = await buildClassReportCards(classId, academicYear, term);
    if (drafts.length === 0) {
      return reply.code(400).send({ error: "no_students_or_class" });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const draft of drafts) {
      const existing = await prisma.reportCard.findUnique({
        where: {
          studentId_academicYear_term: {
            studentId: draft.studentId,
            academicYear,
            term,
          },
        },
      });

      if (existing?.status === "published") {
        skipped += 1;
        continue;
      }

      const data = {
        classId: draft.classId,
        className: draft.className,
        overallTotal: draft.overallTotal,
        overallPercentage: draft.overallPercentage,
        positionInClass: draft.positionInClass,
        classSize: draft.classSize,
        attendancePresent: draft.attendancePresent,
        attendanceTotal: draft.attendanceTotal,
        subjects: draft.subjects,
        classTeacher: draft.classTeacher,
      };

      if (existing) {
        // Teacher remarks already typed on the draft survive a regeneration.
        await prisma.reportCard.update({ where: { id: existing.id }, data });
        updated += 1;
      } else {
        await prisma.reportCard.create({
          data: {
            studentId: draft.studentId,
            academicYear,
            term,
            status: "draft",
            ...data,
          },
        });
        created += 1;
      }
    }

    await recordAudit(request, {
      actor,
      action: "reportcards.generated",
      targetType: "report_card",
      summary: `class=${classId} year=${academicYear} term=${term} created=${created} updated=${updated} skipped_published=${skipped}`,
    });

    return reply.code(201).send({ created, updated, skipped });
  });

  app.patch<{ Params: { id: string } }>(
    "/report-cards/:id",
    async (request, reply) => {
      const actor = await requireCapability(
        request,
        reply,
        "reportcards.publish",
      );
      if (!actor) return;

      const parsed = patchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_request" });
      }

      const card = await prisma.reportCard.findUnique({
        where: { id: request.params.id },
      });
      if (!card) return reply.code(404).send({ error: "not_found" });

      const readable = await resolveReadableClassIds(actor);
      if (readable && card.classId && !readable.includes(card.classId)) {
        return reply.code(403).send({ error: "forbidden" });
      }
      // A published report card is a statement already sent to the family;
      // editing it in place would change what they were told.
      if (card.status === "published") {
        return reply.code(409).send({ error: "already_published" });
      }

      const updated = await prisma.reportCard.update({
        where: { id: card.id },
        data: parsed.data,
      });

      return reply.send({ reportCard: updated });
    },
  );

  // Release drafts to families. Idempotent per card — an already-published card
  // in the batch is counted, not re-notified.
  app.post("/report-cards/publish", async (request, reply) => {
    const actor = await requireCapability(
      request,
      reply,
      "reportcards.publish",
    );
    if (!actor) return;

    const parsed = publishSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const publishedAt =
      parsed.data.publishedAt ?? new Date().toISOString().slice(0, 10);
    const readable = await resolveReadableClassIds(actor);

    let published = 0;
    const forbidden: string[] = [];

    for (const id of parsed.data.ids) {
      const card = await prisma.reportCard.findUnique({ where: { id } });
      if (!card) continue;
      if (readable && card.classId && !readable.includes(card.classId)) {
        forbidden.push(id);
        continue;
      }
      if (card.status === "published") continue;

      await prisma.reportCard.update({
        where: { id },
        data: { status: "published", publishedAt, publishedById: actor.id },
      });
      published += 1;

      // Tell the family. Targeted at the exact parent user, never broadcast.
      const parent = await prisma.parent.findFirst({
        where: { childIds: { has: card.studentId } },
      });
      const student = await prisma.student.findUnique({
        where: { id: card.studentId },
      });
      if (parent?.userId) {
        await notify({
          audience: "user",
          userId: parent.userId,
          title: "Report card available",
          body: `${student?.fullName ?? "Your child"}'s ${card.term} ${card.academicYear} report card has been released. Open Report Cards to view it.`,
          priority: "important",
        });
      }
      if (student?.userId) {
        await notify({
          audience: "user",
          userId: student.userId,
          title: "Report card available",
          body: `Your ${card.term} ${card.academicYear} report card has been released.`,
          priority: "important",
        });
      }
    }

    await recordAudit(request, {
      actor,
      action: "reportcards.published",
      targetType: "report_card",
      summary: `published=${published} requested=${parsed.data.ids.length} forbidden=${forbidden.length} date=${publishedAt}`,
    });

    if (published === 0 && forbidden.length > 0) {
      return reply.code(403).send({ error: "forbidden" });
    }

    return reply.send({ published, forbidden });
  });

  // Pull a released report card back for a correction.
  app.post<{ Params: { id: string } }>(
    "/report-cards/:id/withdraw",
    async (request, reply) => {
      const actor = await requireCapability(
        request,
        reply,
        "reportcards.publish",
      );
      if (!actor) return;

      const card = await prisma.reportCard.findUnique({
        where: { id: request.params.id },
      });
      if (!card) return reply.code(404).send({ error: "not_found" });

      const readable = await resolveReadableClassIds(actor);
      if (readable && card.classId && !readable.includes(card.classId)) {
        return reply.code(403).send({ error: "forbidden" });
      }

      const updated = await prisma.reportCard.update({
        where: { id: card.id },
        data: { status: "draft", publishedAt: null, publishedById: null },
      });

      await recordAudit(request, {
        actor,
        action: "reportcards.withdrawn",
        targetType: "report_card",
        targetId: card.id,
        summary: `student=${card.studentId} year=${card.academicYear} term=${card.term}`,
      });

      return reply.send({ reportCard: updated });
    },
  );
}
