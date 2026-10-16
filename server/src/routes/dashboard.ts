import type { FastifyInstance } from "fastify";

import { requireRole } from "../lib/auth-guard";
import { resolveReadableClassIds } from "../lib/current-staff";
import { prisma } from "../db";

// School-wide aggregate metrics for the admin and accounts dashboards, and the
// per-teacher workload figures for the staff dashboard. These were the last
// numbers in the portal that were invented rather than counted.

type Alert = {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
};

const ATTENDANCE_THRESHOLD = 90;

function percentage(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/dashboard/summary", async (request, reply) => {
    const actor = await requireRole(request, reply, [
      "admin",
      "accounts",
      "registry",
      "developer",
    ]);
    if (!actor) return;

    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalParents,
      totalStaff,
      activeClasses,
      recentAdmissions,
      attendance,
      invoiceTotals,
      paidInvoices,
      overdueInvoices,
      pendingConfirmations,
      verifiedToday,
      lowFeedingWallets,
    ] = await Promise.all([
      prisma.student.count({ where: { status: "active" } }),
      prisma.parent.count({ where: { status: "active" } }),
      prisma.staff.count({ where: { status: "active" } }),
      prisma.schoolClass.count(),
      prisma.student.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.dailyAttendanceRecord.findMany({
        select: { classId: true, mark: true },
      }),
      prisma.invoice.aggregate({
        _sum: { totalAmount: true, amountPaid: true, balance: true },
      }),
      prisma.invoice.count({ where: { status: "paid" } }),
      prisma.invoice.findMany({
        where: { balance: { gt: 0 }, dueDate: { lt: today } },
        select: { id: true, balance: true },
      }),
      prisma.payment.count({ where: { status: "pending" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "verified", paidAt: { gte: new Date(`${today}T00:00:00.000Z`) } },
      }),
      prisma.feedingBalance.count({ where: { balance: { lte: 0 } } }),
    ]);

    // Collection by fee category. Reported as amounts actually received per
    // category rather than a percentage: an invoice carries several fee items
    // and a payment is not allocated across them, so a per-category
    // "percentage collected" would be a guess presented as a fact.
    const byCategory = await prisma.payment.groupBy({
      by: ["category"],
      where: { status: "verified" },
      _sum: { amount: true },
    });

    const present = attendance.filter(
      (record) => record.mark === "present" || record.mark === "late",
    ).length;

    // Per-class attendance, so the alert can name how many classes are below
    // the threshold rather than just quoting the school-wide average.
    const byClass = new Map<string, { present: number; total: number }>();
    for (const record of attendance) {
      const entry = byClass.get(record.classId) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (record.mark === "present" || record.mark === "late") entry.present += 1;
      byClass.set(record.classId, entry);
    }
    const classesBelowThreshold = [...byClass.values()].filter(
      (entry) => entry.total > 0 && percentage(entry.present, entry.total) < ATTENDANCE_THRESHOLD,
    ).length;

    const expectedFees = invoiceTotals._sum.totalAmount ?? 0;
    const receivedPayments = invoiceTotals._sum.amountPaid ?? 0;
    const outstandingBalance = invoiceTotals._sum.balance ?? 0;
    const overdueAmount = overdueInvoices.reduce(
      (sum, invoice) => sum + invoice.balance,
      0,
    );

    // Alerts are derived, never authored: each one states a real count so it
    // disappears on its own once the underlying condition is cleared.
    const alerts: Alert[] = [];

    if (classesBelowThreshold > 0) {
      alerts.push({
        id: "attendance-below-threshold",
        title: "Attendance review",
        description: `${classesBelowThreshold} class${classesBelowThreshold === 1 ? " is" : "es are"} below the ${ATTENDANCE_THRESHOLD}% attendance threshold.`,
        severity: "warning",
      });
    }
    if (pendingConfirmations > 0) {
      alerts.push({
        id: "payments-pending",
        title: "Payments awaiting verification",
        description: `${pendingConfirmations} payment${pendingConfirmations === 1 ? "" : "s"} submitted by families still need checking against a statement.`,
        severity: pendingConfirmations > 10 ? "critical" : "warning",
      });
    }
    if (overdueInvoices.length > 0) {
      alerts.push({
        id: "invoices-overdue",
        title: "Overdue invoices",
        description: `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? "" : "s"} past the due date, totalling GHS ${overdueAmount}.`,
        severity: "critical",
      });
    }
    if (lowFeedingWallets > 0) {
      alerts.push({
        id: "feeding-wallets-empty",
        title: "Empty feeding wallets",
        description: `${lowFeedingWallets} learner${lowFeedingWallets === 1 ? " has" : "s have"} no feeding balance left.`,
        severity: "warning",
      });
    }
    if (alerts.length === 0) {
      alerts.push({
        id: "all-clear",
        title: "Nothing needs attention",
        description:
          "Attendance, payment verification, invoice due dates and feeding balances are all within range.",
        severity: "info",
      });
    }

    return reply.send({
      school: {
        totalStudents,
        totalParents,
        totalStaff,
        activeClasses,
        recentAdmissions,
        attendancePercentage: percentage(present, attendance.length),
      },
      finance: {
        expectedFees,
        receivedPayments,
        outstandingBalance,
        paymentsToday: verifiedToday._sum.amount ?? 0,
        pendingConfirmations,
        paidInvoices,
        overdueInvoices: overdueInvoices.length,
        overdueAmount,
        receivedByCategory: byCategory
          .map((row) => ({
            category: row.category,
            received: row._sum.amount ?? 0,
          }))
          .sort((first, second) => second.received - first.received),
      },
      alerts,
    });
  });

  // The teacher's own week: how much of their marking and register-taking is
  // actually done, scoped to the classes they teach.
  app.get("/dashboard/staff-workload", async (request, reply) => {
    const actor = await requireRole(request, reply, ["staff", "admin"]);
    if (!actor) return;

    const classIds = await resolveReadableClassIds(actor);
    if (classIds && classIds.length === 0) {
      return reply.send({
        registersTaken: 0,
        registersExpected: 0,
        assignmentsGraded: 0,
        assignmentsTotal: 0,
        materialsShared: 0,
        classCount: 0,
      });
    }

    const where = classIds ? { classId: { in: classIds } } : {};
    const today = new Date().toISOString().slice(0, 10);

    const [classCount, registersToday, assignments, gradebook, materials] =
      await Promise.all([
        classIds
          ? Promise.resolve(classIds.length)
          : prisma.schoolClass.count(),
        prisma.dailyAttendanceRecord.findMany({
          where: { ...where, date: today },
          select: { classId: true },
          distinct: ["classId"],
        }),
        prisma.assignmentRecord.findMany({
          where,
          select: { id: true, totalStudents: true, submittedCount: true },
        }),
        prisma.gradebookEntry.count({ where }),
        prisma.learningResource.count({ where }),
      ]);

    // An assignment counts as graded once every submission has a gradebook
    // entry is more than this data model can say, so "graded" here means every
    // expected submission is in: the number the teacher actually chases.
    const assignmentsComplete = assignments.filter(
      (item) =>
        (item.totalStudents ?? 0) > 0 &&
        (item.submittedCount ?? 0) >= (item.totalStudents ?? 0),
    ).length;

    return reply.send({
      registersTaken: registersToday.length,
      registersExpected: classCount,
      assignmentsGraded: assignmentsComplete,
      assignmentsTotal: assignments.length,
      gradebookEntries: gradebook,
      materialsShared: materials,
      classCount,
    });
  });
}
