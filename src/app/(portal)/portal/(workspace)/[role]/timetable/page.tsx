import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, UserRound } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { formatPortalTime } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { listTimetable } from "@/lib/portal/data/academics";
import { isPortalRole } from "@/lib/portal/roles";
import type { TimetableEntry } from "@/types/portal";

export const metadata: Metadata = {
  title: "Timetable",
};

type TimetablePageProps = {
  readonly params: Promise<{ role: string }>;
};

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

function sortByStart(entries: readonly TimetableEntry[]) {
  return entries.toSorted((first, second) =>
    first.startTime.localeCompare(second.startTime),
  );
}

export default async function TimetablePage({ params }: TimetablePageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || (role !== "student" && role !== "staff")) {
    notFound();
  }

  // A teacher's timetable is the same data seen from the other side: the
  // lessons for the classes they teach rather than the ones they attend.
  let timetable: readonly TimetableEntry[];
  let eyebrow: string;
  let description: string;

  if (role === "staff") {
    const staffContext = await getMockStaffPortalContext();
    if (!staffContext) {
      notFound();
    }
    const classIds = new Set(staffContext.staff.classIds);
    timetable = (await listTimetable()).filter((entry) =>
      classIds.has(entry.classId),
    );
    eyebrow = `${staffContext.staff.fullName} · ${staffContext.classes.length} class${staffContext.classes.length === 1 ? "" : "es"}`;
    description = "Your weekly teaching schedule with times, classes and rooms.";
  } else {
    const context = await getMockStudentPortalContext();
    if (!context) {
      notFound();
    }
    timetable = context.timetable;
    eyebrow = `${context.student.className} · ${context.student.studentId}`;
    description = "Your weekly lesson schedule with times, teachers and rooms.";
  }

  const scheduledDays = weekDays.filter((day) =>
    timetable.some((entry) => entry.day === day),
  );

  return (
    <>
      <DashboardHeader
        eyebrow={eyebrow}
        title="Timetable"
        description={description}
        badge="Class schedule"
      />

      {scheduledDays.length ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {scheduledDays.map((day) => {
            const lessons = sortByStart(
              timetable.filter((entry) => entry.day === day),
            );

            return (
              <DashboardCard
                key={day}
                title={day}
                description={`${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`}
                className="xl:h-fit"
              >
                <ol className="space-y-3">
                  {lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="rounded-2xl border border-border bg-soft-white p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-bold text-charcoal">
                          {lesson.subject}
                        </p>
                        <p className="text-sm font-bold text-deep-orange tabular-nums">
                          {formatPortalTime(lesson.startTime)} –{" "}
                          {formatPortalTime(lesson.endTime)}
                        </p>
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-grey">
                        <UserRound aria-hidden="true" className="size-4" />
                        {lesson.teacher}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-grey">
                        <MapPin aria-hidden="true" className="size-4" />
                        {lesson.room}
                      </p>
                    </li>
                  ))}
                </ol>
              </DashboardCard>
            );
          })}
        </div>
      ) : (
        <DashboardCard title="No lessons scheduled" className="mt-8">
          <p className="text-sm text-muted-grey">
            Your class timetable has not been published yet. It will appear here
            once the school office adds it.
          </p>
        </DashboardCard>
      )}
    </>
  );
}
