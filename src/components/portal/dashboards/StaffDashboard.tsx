import {
  CalendarCheck,
  FilePenLine,
  GraduationCap,
  Users,
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
  mockClasses,
  mockTimetable,
} from "@/data/portal/academics";
import { mockAnnouncements } from "@/data/portal/announcements";
import { mockStaff } from "@/data/portal/staff";
import { formatPortalDate, formatPortalTime } from "@/lib/portal/format";

type StaffDashboardProps = {
  readonly userId: string;
  readonly userName: string;
};

export function StaffDashboard({ userId, userName }: StaffDashboardProps) {
  const staff = mockStaff.find((item) => item.userId === userId);

  if (!staff) {
    return null;
  }

  const assignedClasses = mockClasses.filter((item) =>
    staff.classIds.includes(item.id),
  );
  const studentCount = assignedClasses.reduce(
    (total, item) => total + item.studentCount,
    0,
  );
  const todaysClasses = mockTimetable.filter(
    (item) => item.teacher === staff.fullName,
  );
  const reviewAssignments = mockAssignments.filter(
    (item) => item.status === "review",
  );
  const announcements = mockAnnouncements.filter(
    (item) => item.audience === "all" || item.audience === "staff",
  );

  const scheduleRows: readonly DataTableRow[] = todaysClasses.map((entry) => ({
    id: entry.id,
    cells: [
      `${formatPortalTime(entry.startTime)} – ${formatPortalTime(entry.endTime)}`,
      entry.className,
      entry.subject,
      entry.room,
    ],
  }));

  const classRows: readonly DataTableRow[] = assignedClasses.map(
    (classItem) => ({
      id: classItem.id,
      cells: [
        classItem.name,
        classItem.level,
        String(classItem.studentCount),
        classItem.classTeacher === staff.fullName ? (
          <StatusBadge key={classItem.id} variant="success">
            Class teacher
          </StatusBadge>
        ) : (
          <StatusBadge key={classItem.id}>Subject teacher</StatusBadge>
        ),
      ],
    }),
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${staff.title} · ${staff.staffId}`}
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Review today's teaching schedule, assigned classes, outstanding work and school notices."
        badge="Staff mock data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Assigned classes"
          value={String(assignedClasses.length)}
          detail="Across primary and JHS"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Students"
          value={String(studentCount)}
          detail="Across assigned classes"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Pending reviews"
          value={String(reviewAssignments.length)}
          detail="Mock assignment queue"
          icon={<FilePenLine aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Today's classes"
          value={String(todaysClasses.length)}
          detail="Tuesday schedule"
          icon={<CalendarCheck aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Today's teaching schedule"
            description="Mock Tuesday timetable for assigned lessons."
          >
            <DataTable
              caption="Staff teaching schedule"
              columns={["Time", "Class", "Subject", "Room"]}
              rows={scheduleRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Assigned classes"
            description="Review assigned class totals and staff responsibilities."
          >
            <DataTable
              caption="Assigned staff classes"
              columns={["Class", "Level", "Students", "Assignment"]}
              rows={classRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Staff notices">
            <NoticeList announcements={announcements} />
          </DashboardCard>

          <DashboardCard
            title="Weekly workload"
            description="Illustrative preparation status only."
          >
            <div className="space-y-5">
              <ProgressMeter
                label="Attendance records"
                value={75}
                detail="Three of four mock class registers prepared."
                tone="green"
              />
              <ProgressMeter
                label="Assessment entries"
                value={60}
                detail="Continuous assessment entries remain incomplete."
              />
              <ProgressMeter
                label="Course materials"
                value={85}
                detail="Most planned weekly course materials are prepared."
                tone="blue"
              />
            </div>
          </DashboardCard>

          <DashboardCard title="Review queue">
            {reviewAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-2xl border border-border bg-soft-white p-4"
              >
                <p className="font-bold text-charcoal">{assignment.title}</p>
                <p className="mt-1 text-sm text-muted-grey">
                  {assignment.subject} · Due{" "}
                  {formatPortalDate(assignment.dueDate)}
                </p>
              </div>
            ))}
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
