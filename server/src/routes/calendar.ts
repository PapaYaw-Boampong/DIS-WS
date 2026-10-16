import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireUser } from "../lib/auth-guard";
import { resolveParent } from "../lib/current-parent";
import { resolveStaff } from "../lib/current-staff";
import { resolveStudent } from "../lib/current-student";
import { prisma } from "../db";

// One calendar per signed-in user, merging everything that person actually has
// a date for. What goes in differs by role rather than by filter: a parent's
// calendar is school events, fee due dates and report-card releases — NOT their
// child's coursework, which the school has decided stays in the report card.

export type CalendarEntryType =
  | "timetable"
  | "assignment"
  | "event"
  | "fee"
  | "report_card";

type CalendarEntry = {
  id: string;
  type: CalendarEntryType;
  title: string;
  detail: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
};

const rangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  // A month view is ~42 cells; the cap stops a hand-crafted range from asking
  // the server to expand a decade of recurring lessons.
  while (cursor <= end && days.length < 400) {
    days.push(toISO(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function inRange(date: string, from: string, to: string): boolean {
  return Boolean(date) && date >= from && date <= to;
}

/**
 * Timetable rows are recurring ("Monday, 08:00") rather than dated, so they are
 * expanded across the requested window. They are generated per request rather
 * than stored per day — a stored copy would drift the moment a timetable
 * changed, leaving old dates showing lessons that no longer happen.
 */
function expandTimetable(
  entries: readonly {
    id: string;
    subject: string;
    className: string;
    teacher: string;
    room: string;
    day: string;
    startTime: string;
    endTime: string;
  }[],
  days: readonly string[],
): CalendarEntry[] {
  const byWeekday = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = entry.day.trim().toLowerCase();
    byWeekday.set(key, [...(byWeekday.get(key) ?? []), entry]);
  }

  const expanded: CalendarEntry[] = [];
  for (const day of days) {
    const weekday =
      WEEKDAYS[new Date(`${day}T00:00:00.000Z`).getUTCDay()]?.toLowerCase() ?? "";
    for (const entry of byWeekday.get(weekday) ?? []) {
      expanded.push({
        id: `${entry.id}-${day}`,
        type: "timetable",
        title: entry.subject,
        detail: [entry.className, entry.room, entry.teacher]
          .filter(Boolean)
          .join(" · "),
        date: day,
        startTime: entry.startTime,
        endTime: entry.endTime,
      });
    }
  }
  return expanded;
}

export async function calendarRoutes(app: FastifyInstance): Promise<void> {
  app.get("/me/calendar", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const parsed = rangeSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const today = toISO(new Date());
    const from = parsed.data.from ?? today;
    const to =
      parsed.data.to ??
      toISO(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));

    if (to < from) {
      return reply.code(400).send({ error: "invalid_range" });
    }

    const days = eachDay(from, to);
    const entries: CalendarEntry[] = [];

    // School-wide events everyone sees, plus anything addressed to their role.
    const events = await prisma.portalEventRecord.findMany({
      where: { OR: [{ audience: "all" }, { audience: actor.role }] },
    });
    for (const event of events) {
      if (!inRange(event.date, from, to)) continue;
      entries.push({
        id: event.id,
        type: "event",
        title: event.title,
        detail: "School event",
        date: event.date,
        startTime: event.time,
      });
    }

    const student = await resolveStudent(actor.id);
    const staff = student ? null : await resolveStaff(actor.id);
    const parent = student || staff ? null : await resolveParent(actor.id);

    if (student?.classId) {
      const [timetable, assignments] = await Promise.all([
        prisma.timetableEntry.findMany({ where: { classId: student.classId } }),
        prisma.assignmentRecord.findMany({
          where: { classId: student.classId },
        }),
      ]);

      entries.push(...expandTimetable(timetable, days));
      for (const assignment of assignments) {
        if (!inRange(assignment.dueDate, from, to)) continue;
        entries.push({
          id: assignment.id,
          type: "assignment",
          title: assignment.title,
          detail: `${assignment.subject} · due`,
          date: assignment.dueDate,
        });
      }
    }

    if (staff) {
      const [timetable, assignments] = await Promise.all([
        prisma.timetableEntry.findMany({
          where: { classId: { in: staff.classIds } },
        }),
        prisma.assignmentRecord.findMany({
          where: { classId: { in: staff.classIds } },
        }),
      ]);

      entries.push(...expandTimetable(timetable, days));
      for (const assignment of assignments) {
        if (!inRange(assignment.dueDate, from, to)) continue;
        entries.push({
          id: assignment.id,
          type: "assignment",
          title: assignment.title,
          detail: `${assignment.subject} · collection due`,
          date: assignment.dueDate,
        });
      }
    }

    if (parent) {
      // Fee due dates for the family, and report cards as they are released.
      // Deliberately NOT the children's coursework — families follow academic
      // progress through the report card.
      const [invoices, students, reportCards] = await Promise.all([
        prisma.invoice.findMany({
          where: { studentId: { in: parent.childIds }, balance: { gt: 0 } },
        }),
        prisma.student.findMany({ where: { id: { in: parent.childIds } } }),
        prisma.reportCard.findMany({
          where: { studentId: { in: parent.childIds }, status: "published" },
        }),
      ]);
      const nameOf = (id: string) =>
        students.find((item) => item.id === id)?.fullName ?? "Your child";

      for (const invoice of invoices) {
        if (!invoice.dueDate || !inRange(invoice.dueDate, from, to)) continue;
        entries.push({
          id: invoice.id,
          type: "fee",
          title: `Fees due — ${nameOf(invoice.studentId)}`,
          detail: `GHS ${invoice.balance} outstanding`,
          date: invoice.dueDate,
        });
      }

      for (const card of reportCards) {
        if (!card.publishedAt || !inRange(card.publishedAt, from, to)) continue;
        entries.push({
          id: card.id,
          type: "report_card",
          title: `${card.term} report card — ${nameOf(card.studentId)}`,
          detail: "Released to families",
          date: card.publishedAt,
        });
      }
    }

    entries.sort((first, second) => {
      if (first.date !== second.date) return first.date.localeCompare(second.date);
      return (first.startTime ?? "").localeCompare(second.startTime ?? "");
    });

    return reply.send({ from, to, entries });
  });
}
