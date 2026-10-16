import Link from "next/link";
import { Bus, CalendarDays, GraduationCap, School, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { NoticeList } from "@/components/portal/NoticeList";
import { PreviewNote } from "@/components/portal/PreviewNote";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  listAnnouncements,
  listEvents,
} from "@/lib/portal/data/communication";
import { listClasses } from "@/lib/portal/data/people";
import {
  listTransportRoutes,
  listTransportTrips,
} from "@/lib/portal/data/transport";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";
import { getDashboardSummary } from "@/lib/portal/data/dashboard";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

function alertBadge(severity: string) {
  if (severity === "critical") {
    return <StatusBadge variant="danger">Important</StatusBadge>;
  }

  if (severity === "warning") {
    return <StatusBadge variant="warning">Review</StatusBadge>;
  }

  return <StatusBadge variant="info">Information</StatusBadge>;
}

export async function AdminDashboard() {
  const session = await getMockPortalSession();
  const userName = session?.user.name ?? "Administrator";
  const summary = await getDashboardSummary();
  const { school, finance, alerts } = summary;

  const [mockClasses, mockAnnouncements, mockPortalEvents, routes, trips] =
    await Promise.all([
      listClasses(),
      listAnnouncements(),
      listEvents(),
      listTransportRoutes(),
      listTransportTrips(),
    ]);
  const activeTrips = trips.filter(
    (trip) => trip.status === "on_route" || trip.status === "delayed",
  ).length;
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
        description="Classes, fees, transport and the public website. Learner and family records live in the Registry portal; accounts and platform checks live in the Developer portal."
        badge="Admin controls"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Students"
          value={String(school.totalStudents)}
          detail={
            summary.isLive
              ? `${school.recentAdmissions} enrolled in the last 30 days`
              : "Illustrative enrolment total"
          }
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Parents"
          value={String(school.totalParents)}
          detail="Linked family accounts"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Staff"
          value={String(school.totalStaff)}
          detail="Academic and support staff"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Attendance"
          value={`${school.attendancePercentage}%`}
          detail={
            summary.isLive
              ? `School-wide, across ${school.activeClasses} classes`
              : "School-wide illustrative average"
          }
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Class overview"
            description="Every class, with its assigned teacher and roster size."
          >
            <DataTable
              caption="Administrative class overview"
              columns={["Class", "Level", "Students", "Class teacher"]}
              rows={classRows}
            />
          </DashboardCard>

          <div className="grid gap-8 md:grid-cols-2">
            <DashboardCard
              title="Transport today"
              description="Buses running and where to manage them."
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-extrabold text-charcoal tabular-nums">
                    {activeTrips}
                  </p>
                  <p className="mt-1 text-sm text-muted-grey">
                    Trips on route or delayed
                  </p>
                </div>
                <Bus aria-hidden="true" className="size-8 text-curry-orange" />
              </div>
              <p className="mt-6 rounded-2xl bg-soft-white p-4 text-sm leading-6 text-muted-grey">
                {routes.length} route{routes.length === 1 ? "" : "s"} configured
                across the school fleet.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={portalRoutes.transportRoutes("admin")}
                  className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
                >
                  Routes
                </Link>
                <Link
                  href={portalRoutes.transportTrips("admin")}
                  className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
                >
                  Trips
                </Link>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Fees overview"
              description="Read-only finance indicator."
            >
              <ProgressMeter
                label="Collection progress"
                value={
                  finance.expectedFees > 0
                    ? Math.round(
                        (finance.receivedPayments / finance.expectedFees) * 100,
                      )
                    : 0
                }
                detail={`${formatPortalCurrency(finance.receivedPayments)} received of ${formatPortalCurrency(finance.expectedFees)}`}
                tone="green"
              />
              {summary.isLive ? null : (
                <PreviewNote className="mt-6">
                  Illustrative figures. Connect the school database to show real
                  invoice and payment totals.
                </PreviewNote>
              )}
            </DashboardCard>
          </div>
        </div>

        <div className="space-y-8">
          <DashboardCard title="System alerts">
            <ul className="space-y-3">
              {alerts.map((alert) => (
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
