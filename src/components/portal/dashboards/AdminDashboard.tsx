import {
  CalendarDays,
  GraduationCap,
  School,
  UserPlus,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { NoticeList } from "@/components/portal/NoticeList";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { mockClasses } from "@/data/portal/academics";
import { mockAnnouncements, mockPortalEvents } from "@/data/portal/announcements";
import {
  mockAccountsSummary,
  mockAdminAlerts,
  mockAdminSummary,
} from "@/data/portal/dashboard";
import { mockStudents } from "@/data/portal/students";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";

type AdminDashboardProps = {
  readonly userName: string;
};

function alertBadge(severity: string) {
  if (severity === "critical") {
    return <StatusBadge variant="danger">Important</StatusBadge>;
  }

  if (severity === "warning") {
    return <StatusBadge variant="warning">Review</StatusBadge>;
  }

  return <StatusBadge variant="info">Information</StatusBadge>;
}

export function AdminDashboard({ userName }: AdminDashboardProps) {
  const classRows: readonly DataTableRow[] = mockClasses.map((classItem) => ({
    id: classItem.id,
    cells: [
      classItem.name,
      classItem.level,
      String(classItem.studentCount),
      classItem.classTeacher,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow="School operations"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Review school-wide mock indicators and use the role navigation for administrative people, class, fee, and transport controls."
        badge="Admin controls"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Students"
          value={String(mockAdminSummary.totalStudents)}
          detail="Fictional enrolment total"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Parents"
          value={String(mockAdminSummary.totalParents)}
          detail="Linked family accounts"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Staff"
          value={String(mockAdminSummary.totalStaff)}
          detail="Academic and support staff"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Attendance"
          value={`${mockAdminSummary.attendancePercentage}%`}
          detail="School-wide mock average"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Class overview"
            description="Illustrative class totals for the admin shell."
          >
            <DataTable
              caption="Administrative class overview"
              columns={["Class", "Level", "Students", "Class teacher"]}
              rows={classRows}
            />
          </DashboardCard>

          <div className="grid gap-8 md:grid-cols-2">
            <DashboardCard
              title="Admissions snapshot"
              description="Management controls begin in Phase 6."
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-extrabold text-charcoal">
                    {mockAdminSummary.recentAdmissions}
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    Records awaiting review
                  </p>
                </div>
                <UserPlus
                  aria-hidden="true"
                  className="size-8 text-curry-orange"
                />
              </div>
              <div className="mt-6 space-y-3">
                {mockStudents.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-2xl bg-soft-white p-4"
                  >
                    <p className="font-bold text-charcoal">
                      {student.fullName}
                    </p>
                    <p className="text-sm text-muted-grey">
                      {student.className} · Mock record
                    </p>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Fees overview"
              description="Read-only finance indicator."
            >
              <ProgressMeter
                label="Collection progress"
                value={Math.round(
                  (mockAccountsSummary.receivedPayments /
                    mockAccountsSummary.expectedFees) *
                    100,
                )}
                detail={`${formatPortalCurrency(mockAccountsSummary.receivedPayments)} received of ${formatPortalCurrency(mockAccountsSummary.expectedFees)}`}
                tone="green"
              />
              <p className="mt-6 rounded-2xl bg-soft-cream p-4 text-sm leading-6 text-muted-grey">
                No live invoices, payment provider or financial database is
                connected.
              </p>
            </DashboardCard>
          </div>
        </div>

        <div className="space-y-8">
          <DashboardCard title="System alerts">
            <ul className="space-y-3">
              {mockAdminAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-charcoal">{alert.title}</p>
                    {alertBadge(alert.severity)}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-grey">
                    {alert.description}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Announcements">
            <NoticeList
              announcements={mockAnnouncements.filter(
                (item) => item.audience === "all",
              )}
            />
          </DashboardCard>

          <DashboardCard title="Upcoming calendar">
            <ul className="space-y-3">
              {mockPortalEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <p className="font-bold text-charcoal">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {formatPortalDate(event.date)}
                    {event.time ? ` · ${formatPortalTime(event.time)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
