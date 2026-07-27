import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, CalendarX, Clock3, Percent } from "lucide-react";

import { AttendanceMarker } from "@/components/portal/AttendanceMarker";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  listAttendanceSummaries,
  listDailyAttendance,
} from "@/lib/portal/data/academics";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Attendance",
};

type AttendancePageProps = {
  readonly params: Promise<{ role: string }>;
};

const markVariant = {
  present: "success",
  late: "warning",
  absent: "danger",
  excused: "neutral",
} as const;

async function StaffAttendanceView() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const targetClass = context.classes[0];
  const classId = targetClass?.id ?? "";
  const registerDate = "2026-06-23";
  const students = context.students.filter(
    (student) => student.classId === classId,
  );
  const records = (await listDailyAttendance()).filter(
    (record) => record.classId === classId,
  );
  return (
    <>
      <DashboardHeader
        eyebrow={`${targetClass?.name ?? "Class"} · ${formatPortalDate(registerDate)}`}
        title="Attendance register"
        description="Mark a fictional daily class register and preview submission without saving attendance or notifying families."
        badge="Unsaved preview"
      />

      <DashboardCard
        title="Mark attendance"
        description="Changes stay in the browser and reset when the page reloads."
        className="mt-8"
      >
        <AttendanceMarker
          students={students}
          records={records}
          classId={classId}
          date={registerDate}
        />
      </DashboardCard>
    </>
  );
}

async function StudentAttendanceView() {
  const context = await getMockStudentPortalContext();

  if (!context) {
    notFound();
  }

  const [summaries, daily] = await Promise.all([
    listAttendanceSummaries(),
    listDailyAttendance(),
  ]);

  const mySummaries = summaries.filter(
    (summary) => summary.studentId === context.student.id,
  );
  const latest = mySummaries[0];
  const myDaily = daily
    .filter((record) => record.studentId === context.student.id)
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const dailyRows: readonly DataTableRow[] = myDaily.map((record) => ({
    id: `${record.date}-${record.mark}`,
    cells: [
      formatPortalDate(record.date),
      <StatusBadge
        key={record.date}
        variant={
          markVariant[record.mark as keyof typeof markVariant] ?? "neutral"
        }
      >
        {record.mark}
      </StatusBadge>,
      record.note ?? "—",
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.student.className} · ${context.student.studentId}`}
        title="My attendance"
        description="Review your attendance summary for the term and your recent daily record."
        badge="Attendance record"
      />

      {latest ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Attendance"
            value={`${latest.percentage}%`}
            detail={latest.term}
            icon={<Percent aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Present"
            value={String(latest.present)}
            detail="Days this term"
            icon={<CalendarCheck aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Late"
            value={String(latest.late)}
            detail="Days this term"
            icon={<Clock3 aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Absent"
            value={String(latest.absent)}
            detail="Days this term"
            icon={<CalendarX aria-hidden="true" className="size-5" />}
          />
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-sm text-muted-grey">
          No attendance summary is available yet.
        </p>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <DashboardCard
          title="Recent daily record"
          description="Your most recent marked days."
        >
          {dailyRows.length ? (
            <DataTable
              caption="Daily attendance record"
              columns={["Date", "Status", "Note"]}
              rows={dailyRows}
            />
          ) : (
            <p className="py-4 text-sm text-muted-grey">
              No daily records to show yet.
            </p>
          )}
        </DashboardCard>

        {mySummaries.length > 1 ? (
          <DashboardCard
            title="By term"
            description="Attendance percentage per term."
            className="h-fit"
          >
            <ul className="space-y-3">
              {mySummaries.map((summary) => (
                <li
                  key={summary.term}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-soft-white px-4 py-3"
                >
                  <span className="text-sm font-bold text-charcoal">
                    {summary.term}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-deep-orange">
                    {summary.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}
      </div>
    </>
  );
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  if (role === "student") {
    return <StudentAttendanceView />;
  }

  if (role === "staff") {
    return <StaffAttendanceView />;
  }

  notFound();
}
