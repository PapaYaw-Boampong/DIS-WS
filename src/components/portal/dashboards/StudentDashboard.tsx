import Link from "next/link";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Clock3,
  GraduationCap,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { NoticeList } from "@/components/portal/NoticeList";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  mockAssignments,
  mockAttendance,
  mockResults,
  mockTimetable,
} from "@/data/portal/academics";
import { mockAnnouncements } from "@/data/portal/announcements";
import { mockStudents } from "@/data/portal/students";
import {
  formatPortalDate,
  formatPortalTime,
  percentageScore,
} from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";

type StudentDashboardProps = {
  readonly userId: string;
  readonly userName: string;
};

function assignmentBadge(status: string) {
  if (status === "submitted") {
    return <StatusBadge variant="success">Submitted</StatusBadge>;
  }

  if (status === "in_progress") {
    return <StatusBadge variant="warning">In progress</StatusBadge>;
  }

  return <StatusBadge>Not started</StatusBadge>;
}

export function StudentDashboard({
  userId,
  userName,
}: StudentDashboardProps) {
  const student = mockStudents.find((item) => item.userId === userId);

  if (!student) {
    return null;
  }

  const attendance = mockAttendance.find(
    (item) => item.studentId === student.id,
  );
  const assignments = mockAssignments.filter(
    (item) => item.classId === student.classId,
  );
  const openAssignments = assignments.filter(
    (item) => item.status !== "submitted",
  );
  const results = mockResults.filter((item) => item.studentId === student.id);
  const timetable = mockTimetable.filter(
    (item) => item.classId === student.classId,
  );
  const announcements = mockAnnouncements.filter(
    (item) => item.audience === "all" || item.audience === "student",
  );
  const averageScore = Math.round(
    results.reduce(
      (total, result) =>
        total + percentageScore(result.score, result.total),
      0,
    ) / results.length,
  );

  const timetableRows: readonly DataTableRow[] = timetable.map((entry) => ({
    id: entry.id,
    cells: [
      `${formatPortalTime(entry.startTime)} – ${formatPortalTime(entry.endTime)}`,
      entry.subject,
      entry.teacher,
      entry.room,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow={`${student.className} · ${student.studentId}`}
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Review today's lessons, pending work, recent results and school notices from one dashboard."
        badge="Student mock data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Attendance"
          value={`${attendance?.percentage ?? 0}%`}
          detail="Current term"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Assignments"
          value={String(
            assignments.filter((item) => item.status !== "submitted").length,
          )}
          detail="Still active"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Average score"
          value={`${averageScore}%`}
          detail="Recent assessments"
          icon={
            <ChartNoAxesColumnIncreasing
              aria-hidden="true"
              className="size-5"
            />
          }
        />
        <MetricCard
          label="Today's lessons"
          value={String(timetable.length)}
          detail="Tuesday schedule"
          icon={<Clock3 aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Today's timetable"
            description="Mock Tuesday schedule for the current class."
          >
            <DataTable
              caption="Student timetable"
              columns={["Time", "Subject", "Teacher", "Room"]}
              rows={timetableRows}
            />
          </DashboardCard>

          <DashboardCard
            title="To Do summary"
            description="Open coursework now lives on the dedicated To Do page."
          >
            <div className="space-y-4">
              {openAssignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-bold text-charcoal">
                      {assignment.title}
                    </p>
                    {assignmentBadge(assignment.status)}
                  </div>
                  <p className="mt-1 text-sm text-muted-grey">
                    {assignment.subject} · Due{" "}
                    {formatPortalDate(assignment.dueDate)}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={portalRoutes.studentTodo}
              className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Open To Do page
            </Link>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Recent notices">
            <NoticeList announcements={announcements} />
          </DashboardCard>

          <DashboardCard
            title="Recent results"
            description="Latest fictional assessment scores."
          >
            <div className="space-y-5">
              {results.map((result) => {
                const percentage = percentageScore(
                  result.score,
                  result.total,
                );

                return (
                  <ProgressMeter
                    key={result.id}
                    label={`${result.subject} · ${result.assessment}`}
                    value={percentage}
                    detail={`${result.score}/${result.total} · ${formatPortalDate(result.gradedAt)}`}
                    tone={percentage >= 85 ? "green" : "orange"}
                  />
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard title="Student profile">
            <div className="flex gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <GraduationCap aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="font-bold text-charcoal">{student.fullName}</p>
                <p className="mt-1 text-sm text-muted-grey">
                  {student.level} · {student.className}
                </p>
                <p className="mt-1 text-sm text-muted-grey">
                  Feeding plan: {student.feedingPlan ?? "None"}
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
