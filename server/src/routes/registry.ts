import { randomBytes } from "node:crypto";

import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { recordAudit } from "../lib/audit";
import { requireCapability, roleHasCapability } from "../lib/capabilities";
import { generateTempPassword, hashPassword } from "../lib/password";
import { prisma } from "../db";

// Registry: the people record system. Creating learners, guardians and staff,
// bulk enrolment from a spreadsheet, and end-of-year progression. Every route
// is gated on a capability rather than a role, so the school can move these
// responsibilities between `registry` and `admin` from the developer portal.

const studentSchema = z.object({
  fullName: z.string().min(1),
  studentId: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  classId: z.string().min(1),
  className: z.string().optional().default(""),
  level: z.string().optional().default(""),
  admissionDate: z.string().optional().default(""),
  previousSchool: z.string().optional().default(""),
  guardianIds: z.array(z.string()).optional().default([]),
  guardianName: z.string().optional().default(""),
  guardianRelationship: z.string().optional().default(""),
  guardianPhone: z.string().optional().default(""),
  guardianEmail: z.string().optional().default(""),
  address: z.string().optional().default(""),
  emergencyContactName: z.string().optional().default(""),
  emergencyContactPhone: z.string().optional().default(""),
  medicalNotes: z.string().optional().default(""),
  feedingPlan: z.string().optional().default("none"),
  transportRouteId: z.string().optional().default(""),
  status: z.string().optional().default("active"),
});

const parentSchema = z.object({
  fullName: z.string().min(1),
  relationship: z.string().optional().default(""),
  phone: z.string().min(1),
  alternatePhone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  address: z.string().optional().default(""),
  occupation: z.string().optional().default(""),
  idType: z.string().optional().default(""),
  idNumber: z.string().optional().default(""),
  childIds: z.array(z.string()).optional().default([]),
  createPortalAccount: z.boolean().optional().default(false),
  status: z.string().optional().default("active"),
});

const staffSchema = z.object({
  fullName: z.string().min(1),
  staffId: z.string().optional().default(""),
  title: z.string().min(1),
  department: z.string().optional().default(""),
  employmentType: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  qualification: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  address: z.string().optional().default(""),
  classIds: z.array(z.string()).optional().default([]),
  subjectIds: z.array(z.string()).optional().default([]),
  portalRole: z.string().optional().default(""),
  status: z.string().optional().default("active"),
});

const promotionSchema = z.object({
  academicYear: z.string().min(1),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        studentName: z.string().optional().default(""),
        fromClassId: z.string().optional().default(""),
        toClassId: z.string().optional().default(""),
        outcome: z.enum(["promote", "repeat", "graduate", "transfer"]),
      }),
    )
    .min(1),
});

const importSchema = z.object({
  rows: z
    .array(
      z.object({
        fullName: z.string().min(1),
        studentId: z.string().optional().default(""),
        className: z.string().optional().default(""),
        level: z.string().optional().default(""),
        dateOfBirth: z.string().optional().default(""),
        gender: z.string().optional().default(""),
        guardianName: z.string().optional().default(""),
        guardianPhone: z.string().optional().default(""),
        guardianEmail: z.string().optional().default(""),
      }),
    )
    .min(1),
});

const classSchema = z.object({
  name: z.string().min(1),
  level: z.string().optional().default(""),
  classTeacher: z.string().optional().default(""),
});

// School-issued learner number when the registry does not supply one. Random
// rather than sequential so a failed insert cannot leave a gap that a later
// insert silently reuses.
function generateStudentId(): string {
  const year = new Date().getFullYear();
  return `DIS-${year}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function generateStaffId(): string {
  return `STF-${randomBytes(2).toString("hex").toUpperCase()}`;
}

// A class roster count is derived, never hand-maintained — recompute it after
// anything that moves learners in or out.
async function refreshClassCounts(classIds: readonly string[]): Promise<void> {
  for (const classId of [...new Set(classIds)].filter(Boolean)) {
    const studentCount = await prisma.student.count({
      where: { classId, status: "active" },
    });
    await prisma.schoolClass
      .update({ where: { id: classId }, data: { studentCount } })
      .catch(() => undefined);
  }
}

// Keep the two sides of the guardian↔learner link in step. Both Student and
// Parent carry a scalar id list (mirroring the portal's mock shape), so a link
// written on one side only would show the child to the parent but not the
// parent to the child.
async function linkGuardians(
  studentId: string,
  guardianIds: readonly string[],
): Promise<void> {
  for (const parentId of guardianIds) {
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });
    if (!parent || parent.childIds.includes(studentId)) continue;
    await prisma.parent.update({
      where: { id: parentId },
      data: { childIds: [...parent.childIds, studentId] },
    });
  }
}

async function linkChildren(
  parentId: string,
  childIds: readonly string[],
): Promise<void> {
  for (const studentId of childIds) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || student.parentIds.includes(parentId)) continue;
    await prisma.student.update({
      where: { id: studentId },
      data: { parentIds: [...student.parentIds, parentId] },
    });
  }
}

export async function registryRoutes(app: FastifyInstance): Promise<void> {
  app.post("/students", async (request, reply) => {
    const actor = await requireCapability(request, reply, "students.create");
    if (!actor) return;

    const parsed = studentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const intake = parsed.data;

    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: intake.classId },
    });
    if (!schoolClass) {
      return reply.code(400).send({ error: "class_not_found" });
    }

    const studentId = intake.studentId.trim() || generateStudentId();
    if (await prisma.student.findUnique({ where: { studentId } })) {
      return reply.code(409).send({ error: "student_id_taken" });
    }

    const student = await prisma.student.create({
      data: {
        fullName: intake.fullName.trim(),
        studentId,
        classId: schoolClass.id,
        className: schoolClass.name,
        level: intake.level || schoolClass.level,
        status: intake.status,
        parentIds: intake.guardianIds,
        transportRouteId: intake.transportRouteId || null,
        feedingPlan: intake.feedingPlan || "none",
        dateOfBirth: intake.dateOfBirth,
        gender: intake.gender,
        admissionDate: intake.admissionDate,
        previousSchool: intake.previousSchool,
        guardianName: intake.guardianName,
        guardianRelationship: intake.guardianRelationship,
        guardianPhone: intake.guardianPhone,
        guardianEmail: intake.guardianEmail,
        address: intake.address,
        emergencyContactName: intake.emergencyContactName,
        emergencyContactPhone: intake.emergencyContactPhone,
        medicalNotes: intake.medicalNotes,
      },
    });

    await linkGuardians(student.id, intake.guardianIds);
    await refreshClassCounts([schoolClass.id]);

    await recordAudit(request, {
      actor,
      action: "registry.student_created",
      targetType: "student",
      targetId: student.id,
      summary: `name=${student.fullName} studentId=${student.studentId} class=${schoolClass.name} guardians=${intake.guardianIds.length}`,
    });

    return reply.code(201).send({ student });
  });

  app.post("/parents", async (request, reply) => {
    const actor = await requireCapability(request, reply, "parents.create");
    if (!actor) return;

    const parsed = parentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const intake = parsed.data;
    const email = intake.email.trim().toLowerCase();

    // A guardian portal account is the one login the registry may issue without
    // `accounts.manage`: `parent` is the least-privileged role, so it carries no
    // escalation risk. Anything above that stays with account management.
    let tempPassword: string | undefined;
    let userId: string | null = null;

    if (intake.createPortalAccount) {
      if (!email.includes("@")) {
        return reply.code(400).send({ error: "email_required_for_account" });
      }
      if (await prisma.user.findUnique({ where: { email } })) {
        return reply.code(409).send({ error: "email_taken" });
      }
      tempPassword = generateTempPassword();
      const user = await prisma.user.create({
        data: {
          name: intake.fullName.trim(),
          email,
          role: "PARENT",
          passwordHash: await hashPassword(tempPassword),
          mustChangePassword: true,
        },
      });
      userId = user.id;
    }

    const parent = await prisma.parent.create({
      data: {
        userId,
        fullName: intake.fullName.trim(),
        phone: intake.phone.trim(),
        email,
        childIds: intake.childIds,
        status: intake.status,
        relationship: intake.relationship,
        alternatePhone: intake.alternatePhone,
        address: intake.address,
        occupation: intake.occupation,
        idType: intake.idType,
        idNumber: intake.idNumber,
      },
    });

    await linkChildren(parent.id, intake.childIds);

    await recordAudit(request, {
      actor,
      action: "registry.parent_created",
      targetType: "parent",
      targetId: parent.id,
      summary: `name=${parent.fullName} children=${intake.childIds.length} account=${userId ? "created" : "none"}`,
    });

    return reply.code(201).send({ parent, tempPassword });
  });

  app.post("/staff", async (request, reply) => {
    const actor = await requireCapability(request, reply, "staff.create");
    if (!actor) return;

    const parsed = staffSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const intake = parsed.data;
    const email = intake.email.trim().toLowerCase();

    const staffId = intake.staffId.trim() || generateStaffId();
    if (await prisma.staff.findUnique({ where: { staffId } })) {
      return reply.code(409).send({ error: "staff_id_taken" });
    }

    // A staff login can be a privileged one (admin/accounts/transport), so
    // issuing it needs `accounts.manage`. Without that the staff RECORD is
    // still created and the requested role is kept for whoever does have it.
    const requestedRole = intake.portalRole.trim().toLowerCase();
    const mayIssueAccount = await roleHasCapability(actor.role, "accounts.manage");
    let tempPassword: string | undefined;
    let userId: string | null = null;

    if (requestedRole && mayIssueAccount && email.includes("@")) {
      if (await prisma.user.findUnique({ where: { email } })) {
        return reply.code(409).send({ error: "email_taken" });
      }
      tempPassword = generateTempPassword();
      const user = await prisma.user.create({
        data: {
          name: intake.fullName.trim(),
          email,
          role: requestedRole.toUpperCase() as "STAFF",
          passwordHash: await hashPassword(tempPassword),
          mustChangePassword: true,
        },
      });
      userId = user.id;
    }

    const staff = await prisma.staff.create({
      data: {
        userId,
        fullName: intake.fullName.trim(),
        staffId,
        title: intake.title.trim(),
        classIds: intake.classIds,
        subjectIds: intake.subjectIds,
        status: intake.status,
        department: intake.department,
        employmentType: intake.employmentType,
        startDate: intake.startDate,
        qualification: intake.qualification,
        phone: intake.phone,
        email,
        address: intake.address,
        requestedPortalRole: requestedRole,
      },
    });

    await recordAudit(request, {
      actor,
      action: "registry.staff_created",
      targetType: "staff",
      targetId: staff.id,
      summary: `name=${staff.fullName} staffId=${staff.staffId} classes=${intake.classIds.length} account=${userId ? "created" : "not_issued"}`,
    });

    return reply.code(201).send({
      staff,
      tempPassword,
      accountPending: Boolean(requestedRole) && !userId,
    });
  });

  // End-of-year progression. Applied per entry so one bad row (a class that has
  // since been deleted) cannot roll back the whole year's promotions.
  app.post("/students/promotions", async (request, reply) => {
    const actor = await requireCapability(request, reply, "students.promote");
    if (!actor) return;

    const parsed = promotionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    const { academicYear, entries } = parsed.data;

    const touchedClasses: string[] = [];
    let applied = 0;
    const skipped: string[] = [];

    for (const entry of entries) {
      const student = await prisma.student.findUnique({
        where: { id: entry.studentId },
      });
      if (!student) {
        skipped.push(entry.studentId);
        continue;
      }

      if (entry.outcome === "promote") {
        const target = entry.toClassId
          ? await prisma.schoolClass.findUnique({ where: { id: entry.toClassId } })
          : null;
        if (!target) {
          skipped.push(entry.studentId);
          continue;
        }
        await prisma.student.update({
          where: { id: student.id },
          data: {
            classId: target.id,
            className: target.name,
            level: target.level,
          },
        });
        touchedClasses.push(target.id, student.classId ?? "");
      } else if (entry.outcome === "graduate") {
        await prisma.student.update({
          where: { id: student.id },
          data: { status: "graduated" },
        });
        touchedClasses.push(student.classId ?? "");
      } else if (entry.outcome === "transfer") {
        await prisma.student.update({
          where: { id: student.id },
          data: { status: "transferred" },
        });
        touchedClasses.push(student.classId ?? "");
      }
      // "repeat" deliberately writes no student change — the learner stays in
      // the class they are already in. The decision is still recorded below.

      await prisma.studentPromotion.upsert({
        where: {
          studentId_academicYear: { studentId: student.id, academicYear },
        },
        create: {
          studentId: student.id,
          academicYear,
          fromClassId: entry.fromClassId || student.classId,
          toClassId: entry.toClassId || null,
          outcome: entry.outcome,
          recordedById: actor.id,
        },
        update: {
          fromClassId: entry.fromClassId || student.classId,
          toClassId: entry.toClassId || null,
          outcome: entry.outcome,
          recordedById: actor.id,
        },
      });
      applied += 1;
    }

    await refreshClassCounts(touchedClasses);

    await recordAudit(request, {
      actor,
      action: "registry.students_promoted",
      targetType: "student",
      summary: `year=${academicYear} applied=${applied} skipped=${skipped.length}`,
    });

    return reply.code(201).send({ applied, skipped });
  });

  // Bulk enrolment from a spreadsheet. Rows are independent: a duplicate
  // learner number is reported back, not fatal, so one bad line in a 200-row
  // class list does not discard the other 199.
  app.post("/students/import", async (request, reply) => {
    const actor = await requireCapability(request, reply, "students.import");
    if (!actor) return;

    const parsed = importSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const classes = await prisma.schoolClass.findMany();
    const byName = new Map(
      classes.map((item) => [item.name.trim().toLowerCase(), item]),
    );

    const created: string[] = [];
    const skipped: { row: string; reason: string }[] = [];
    const touchedClasses: string[] = [];

    for (const row of parsed.data.rows) {
      const schoolClass = byName.get(row.className.trim().toLowerCase());
      const studentId = row.studentId.trim() || generateStudentId();

      if (await prisma.student.findUnique({ where: { studentId } })) {
        skipped.push({ row: row.fullName, reason: "duplicate_student_id" });
        continue;
      }

      const student = await prisma.student.create({
        data: {
          fullName: row.fullName.trim(),
          studentId,
          classId: schoolClass?.id ?? null,
          className: schoolClass?.name ?? row.className,
          level: row.level || schoolClass?.level || "",
          parentIds: [],
          dateOfBirth: row.dateOfBirth,
          gender: row.gender,
          guardianName: row.guardianName,
          guardianPhone: row.guardianPhone,
          guardianEmail: row.guardianEmail,
        },
      });
      created.push(student.id);
      if (schoolClass) touchedClasses.push(schoolClass.id);
    }

    await refreshClassCounts(touchedClasses);

    await recordAudit(request, {
      actor,
      action: "registry.students_imported",
      targetType: "student",
      summary: `created=${created.length} skipped=${skipped.length}`,
    });

    return reply.code(201).send({ created: created.length, skipped });
  });

  app.post("/classes", async (request, reply) => {
    const actor = await requireCapability(request, reply, "classes.manage");
    if (!actor) return;

    const parsed = classSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const schoolClass = await prisma.schoolClass.create({
      data: {
        name: parsed.data.name.trim(),
        level: parsed.data.level || parsed.data.name.trim(),
        classTeacher: parsed.data.classTeacher,
        studentCount: 0,
      },
    });

    await recordAudit(request, {
      actor,
      action: "registry.class_created",
      targetType: "class",
      targetId: schoolClass.id,
      summary: `name=${schoolClass.name} teacher=${schoolClass.classTeacher || "unassigned"}`,
    });

    return reply.code(201).send({ class: schoolClass });
  });
}
