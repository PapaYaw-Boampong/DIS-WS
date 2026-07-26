import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole, requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { canWriteClass, resolveReadableClassIds } from "../lib/current-staff";
import { resolveStudent } from "../lib/current-student";
import { isAllowedUploadMimeType } from "../lib/file-validation";
import { getObjectBytes, uploadObject } from "../lib/storage";
import { prisma } from "../db";

const STAFF = ["admin", "staff"] as const;

type GradeInput = {
  studentId?: string;
  subject?: string;
  assessment?: string;
  score?: number;
  total?: number;
  status?: string;
};

type MarkInput = {
  studentId?: string;
  mark?: string;
  note?: string;
};

// Course materials and submissions cap out well under the Fastify JSON body
// limit (base64 inflates raw bytes ~33%).
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const fileInputSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  dataBase64: z.string().min(1),
});

function inferFileType(mimeType: string, fileName: string): string {
  const lower = `${mimeType} ${fileName}`.toLowerCase();
  if (lower.includes("pdf")) return "pdf";
  if (
    lower.includes("presentation") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx")
  ) {
    return "presentation";
  }
  return "document";
}

async function studentIdsForClasses(classIds: readonly string[]): Promise<string[]> {
  const students = await prisma.student.findMany({
    where: { classId: { in: classIds as string[] } },
    select: { id: true },
  });
  return students.map((student) => student.id);
}

// Read access to a class's materials: admins any class; staff their assigned
// classes (same rule as canWriteClass); students their own class only.
async function canAccessClass(
  actor: { id: string; role: string },
  classId: string,
): Promise<boolean> {
  if (actor.role === "student") {
    const student = await resolveStudent(actor.id);
    return student?.classId === classId;
  }
  return canWriteClass(actor, classId);
}

export async function academicsRoutes(app: FastifyInstance): Promise<void> {
  // School-wide content (not per-student sensitive). The Next.js BFF fetches
  // server-side and scopes what it renders to each viewer.
  app.get("/courses", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({ courses: await prisma.course.findMany() });
  });

  app.get("/course-modules", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      modules: await prisma.courseModule.findMany({
        orderBy: { position: "asc" },
      }),
    });
  });

  app.get("/assignments", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      assignments: await prisma.assignmentRecord.findMany(),
    });
  });

  app.get("/timetable", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({ timetable: await prisma.timetableEntry.findMany() });
  });

  app.get("/learning-resources", async (request, reply) => {
    if (!(await requireUser(request, reply))) return;
    return reply.send({
      resources: await prisma.learningResource.findMany({
        orderBy: { createdAt: "desc" },
      }),
    });
  });

  // Staff/admin: upload a real course material file to one of their classes.
  app.post("/learning-resources", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;

    const parsed = z
      .object({
        classId: z.string().min(1),
        courseId: z.string().min(1).optional(),
        subject: z.string().min(1),
        title: z.string().min(1),
        file: fileInputSchema,
      })
      .safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    if (!(await canWriteClass(actor, parsed.data.classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }
    if (!isAllowedUploadMimeType(parsed.data.file.mimeType)) {
      return reply.code(400).send({ error: "unsupported_file_type" });
    }

    const bytes = Buffer.from(parsed.data.file.dataBase64, "base64");
    if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) {
      return reply.code(413).send({ error: "file_too_large" });
    }

    const resource = await prisma.learningResource.create({
      data: {
        classId: parsed.data.classId,
        courseId: parsed.data.courseId ?? null,
        subject: parsed.data.subject,
        title: parsed.data.title,
        fileName: parsed.data.file.fileName,
        fileType: inferFileType(parsed.data.file.mimeType, parsed.data.file.fileName),
        sharedAt: new Date().toISOString().slice(0, 10),
        status: "published",
        fileSize: bytes.length,
        mimeType: parsed.data.file.mimeType,
      },
    });
    const objectKey = `learning-resources/${resource.id}`;
    await uploadObject(objectKey, bytes, parsed.data.file.mimeType);
    const updated = await prisma.learningResource.update({
      where: { id: resource.id },
      data: { objectKey },
    });

    await recordAudit(request, {
      actor,
      action: "academics.material_uploaded",
      targetType: "learning_resource",
      targetId: resource.id,
      summary: `classId=${parsed.data.classId} title=${parsed.data.title}`,
    });

    return reply.code(201).send({ resource: updated });
  });

  // Any signed-in user with access to the class may download its materials:
  // admins any class, staff their own classes, students their own class.
  app.get("/learning-resources/:id/download", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const resource = await prisma.learningResource.findUnique({ where: { id } });
    if (!resource || !resource.objectKey) {
      return reply.code(404).send({ error: "not_found" });
    }
    if (!(await canAccessClass(actor, resource.classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const bytes = await getObjectBytes(resource.objectKey);
    if (!bytes) return reply.code(404).send({ error: "not_found" });

    await recordAudit(request, {
      actor,
      action: "academics.material_downloaded",
      targetType: "learning_resource",
      targetId: id,
    });

    return reply
      .header("content-type", resource.mimeType ?? "application/octet-stream")
      .header(
        "content-disposition",
        `inline; filename="${resource.fileName}"`,
      )
      .send(bytes);
  });

  // Per-student sensitive → staff see only their assigned classes, admin sees
  // all (resolveReadableClassIds returns null for admin, meaning no filter).
  app.get("/results", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;
    const classIds = await resolveReadableClassIds(actor);
    const where = classIds
      ? { studentId: { in: await studentIdsForClasses(classIds) } }
      : undefined;
    return reply.send({ results: await prisma.resultRecord.findMany({ where }) });
  });

  app.get("/attendance-summaries", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;
    const classIds = await resolveReadableClassIds(actor);
    const where = classIds
      ? { studentId: { in: await studentIdsForClasses(classIds) } }
      : undefined;
    return reply.send({
      attendance: await prisma.attendanceSummary.findMany({ where }),
    });
  });

  app.get("/daily-attendance", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;
    const classIds = await resolveReadableClassIds(actor);
    const where = classIds ? { classId: { in: classIds } } : undefined;
    return reply.send({
      dailyAttendance: await prisma.dailyAttendanceRecord.findMany({ where }),
    });
  });

  app.get("/gradebook", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;
    const classIds = await resolveReadableClassIds(actor);
    const where = classIds ? { classId: { in: classIds } } : undefined;
    return reply.send({
      gradebook: await prisma.gradebookEntry.findMany({ where }),
    });
  });

  // --- Staff writes (class-scoped) ---------------------------------------

  // Create an assignment for one of the staff member's classes.
  app.post("/assignments", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;

    const body = request.body as
      | {
          classId?: string;
          courseId?: string;
          subject?: string;
          title?: string;
          instructions?: string;
          dueDate?: string;
        }
      | undefined;
    const classId = body?.classId?.trim();
    const subject = body?.subject?.trim();
    const title = body?.title?.trim();
    const dueDate = body?.dueDate?.trim();
    if (!classId || !subject || !title || !dueDate) {
      return reply.code(400).send({ error: "invalid" });
    }
    if (!(await canWriteClass(actor, classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const totalStudents = await prisma.student.count({ where: { classId } });
    const assignment = await prisma.assignmentRecord.create({
      data: {
        classId,
        courseId: body?.courseId?.trim() || null,
        subject,
        title,
        instructions: body?.instructions?.trim() || null,
        dueDate,
        totalStudents,
        submittedCount: 0,
        status: "not_started",
      },
    });
    await recordAudit(request, {
      actor,
      action: "academics.assignment_created",
      targetType: "assignment",
      targetId: assignment.id,
      summary: `classId=${classId} title=${title}`,
    });
    return reply.code(201).send({ assignment });
  });

  // Save gradebook marks for a class (bulk upsert by class+student+subject+
  // assessment). Used by the editable gradebook grid / SpeedGrader.
  app.post("/gradebook", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;

    const body = request.body as
      | { classId?: string; entries?: GradeInput[] }
      | undefined;
    const classId = body?.classId?.trim();
    const entries = body?.entries ?? [];
    if (!classId || entries.length === 0) {
      return reply.code(400).send({ error: "invalid" });
    }
    if (!(await canWriteClass(actor, classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }

    let saved = 0;
    for (const entry of entries) {
      const studentId = entry.studentId?.trim();
      const subject = entry.subject?.trim();
      const assessment = entry.assessment?.trim();
      if (
        !studentId ||
        !subject ||
        !assessment ||
        typeof entry.score !== "number" ||
        typeof entry.total !== "number"
      ) {
        continue;
      }
      const status = entry.status === "published" ? "published" : "draft";
      await prisma.gradebookEntry.upsert({
        where: {
          classId_studentId_subject_assessment: {
            classId,
            studentId,
            subject,
            assessment,
          },
        },
        create: {
          classId,
          studentId,
          subject,
          assessment,
          score: entry.score,
          total: entry.total,
          status,
        },
        update: { score: entry.score, total: entry.total, status },
      });
      saved += 1;
    }
    await recordAudit(request, {
      actor,
      action: "academics.gradebook_saved",
      targetType: "class",
      targetId: classId,
      summary: `saved=${saved}`,
    });
    return reply.send({ ok: true, saved });
  });

  // Submit a daily attendance register for a class/date (bulk upsert).
  app.post("/daily-attendance", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;

    const body = request.body as
      | { classId?: string; date?: string; marks?: MarkInput[] }
      | undefined;
    const classId = body?.classId?.trim();
    const date = body?.date?.trim();
    const marks = body?.marks ?? [];
    if (!classId || !date || marks.length === 0) {
      return reply.code(400).send({ error: "invalid" });
    }
    if (!(await canWriteClass(actor, classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }

    let saved = 0;
    for (const entry of marks) {
      const studentId = entry.studentId?.trim();
      const mark = entry.mark?.trim();
      if (!studentId || !mark) {
        continue;
      }
      await prisma.dailyAttendanceRecord.upsert({
        where: {
          classId_studentId_date: { classId, studentId, date },
        },
        create: {
          classId,
          studentId,
          date,
          mark,
          note: entry.note?.trim() || null,
        },
        update: { mark, note: entry.note?.trim() || null },
      });
      saved += 1;
    }
    await recordAudit(request, {
      actor,
      action: "academics.attendance_saved",
      targetType: "class",
      targetId: classId,
      summary: `date=${date} saved=${saved}`,
    });
    return reply.send({ ok: true, saved });
  });

  // Staff/admin: list submissions for one of their assignments.
  app.get("/assignments/:id/submissions", async (request, reply) => {
    const actor = await requireRole(request, reply, STAFF);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const assignment = await prisma.assignmentRecord.findUnique({
      where: { id },
    });
    if (!assignment) return reply.code(404).send({ error: "not_found" });
    if (!(await canWriteClass(actor, assignment.classId))) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId: id },
      orderBy: { submittedAt: "desc" },
    });
    return reply.send({ submissions });
  });

  // Student: submit (or re-submit) a file for an assignment in their own class.
  app.post("/assignments/:id/submissions", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    if (actor.role !== "student") {
      return reply.code(403).send({ error: "forbidden" });
    }

    const { id } = request.params as { id: string };
    const assignment = await prisma.assignmentRecord.findUnique({
      where: { id },
    });
    if (!assignment) return reply.code(404).send({ error: "not_found" });

    const student = await resolveStudent(actor.id);
    if (!student || student.classId !== assignment.classId) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const parsed = z.object({ file: fileInputSchema }).safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    if (!isAllowedUploadMimeType(parsed.data.file.mimeType)) {
      return reply.code(400).send({ error: "unsupported_file_type" });
    }

    const bytes = Buffer.from(parsed.data.file.dataBase64, "base64");
    if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) {
      return reply.code(413).send({ error: "file_too_large" });
    }

    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId: id, studentId: student.id },
      },
    });

    const objectKey = `assignment-submissions/${id}/${student.id}`;
    await uploadObject(objectKey, bytes, parsed.data.file.mimeType);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: { assignmentId: id, studentId: student.id },
      },
      create: {
        assignmentId: id,
        studentId: student.id,
        fileName: parsed.data.file.fileName,
        mimeType: parsed.data.file.mimeType,
        objectKey,
      },
      update: {
        fileName: parsed.data.file.fileName,
        mimeType: parsed.data.file.mimeType,
        objectKey,
        submittedAt: new Date(),
      },
    });

    if (!existing) {
      await prisma.assignmentRecord.update({
        where: { id },
        data: { submittedCount: { increment: 1 } },
      });
    }

    await recordAudit(request, {
      actor,
      action: "academics.submission_created",
      targetType: "assignment_submission",
      targetId: submission.id,
      summary: `assignmentId=${id} studentId=${student.id} resubmit=${Boolean(existing)}`,
    });

    return reply.code(201).send({ submission });
  });

  // Student: check their own submission status for one assignment.
  app.get("/assignments/:id/submissions/me", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const student = await resolveStudent(actor.id);
    if (!student) return reply.send({ submission: null });

    const { id } = request.params as { id: string };
    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: { assignmentId: id, studentId: student.id },
      },
    });
    return reply.send({ submission });
  });

  // Download a submission: staff/admin of the assignment's class, or the
  // submitting student themselves.
  app.get("/submissions/:id/download", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id },
    });
    if (!submission) return reply.code(404).send({ error: "not_found" });

    if (actor.role === "student") {
      const student = await resolveStudent(actor.id);
      if (!student || student.id !== submission.studentId) {
        return reply.code(403).send({ error: "forbidden" });
      }
    } else {
      const assignment = await prisma.assignmentRecord.findUnique({
        where: { id: submission.assignmentId },
      });
      if (!assignment || !(await canWriteClass(actor, assignment.classId))) {
        return reply.code(403).send({ error: "forbidden" });
      }
    }

    const bytes = await getObjectBytes(submission.objectKey);
    if (!bytes) return reply.code(404).send({ error: "not_found" });

    await recordAudit(request, {
      actor,
      action: "academics.submission_downloaded",
      targetType: "assignment_submission",
      targetId: id,
    });

    return reply
      .header("content-type", submission.mimeType)
      .header(
        "content-disposition",
        `inline; filename="${submission.fileName}"`,
      )
      .send(bytes);
  });

  // Student self-scoped.
  app.get("/me/student", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    return reply.send({ student: await resolveStudent(user.id) });
  });

  app.get("/me/results", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const student = await resolveStudent(user.id);
    return reply.send({
      results: student
        ? await prisma.resultRecord.findMany({ where: { studentId: student.id } })
        : [],
    });
  });

  app.get("/me/attendance", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const student = await resolveStudent(user.id);
    return reply.send({
      attendance: student
        ? await prisma.attendanceSummary.findMany({
            where: { studentId: student.id },
          })
        : [],
    });
  });
}
