import Link from "next/link";
import { CalendarDays, Users, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { NoticeList } from "@/components/portal/NoticeList";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  listAttendanceSummaries,
  listResults,
} from "@/lib/portal/data/academics";
import { listAnnouncements } from "@/lib/portal/data/communication";
import {
  getParentInvoices,
  getParentPayments,
  getParentTransport,
} from "@/lib/portal/data/parent";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
  percentageScore,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { portalRoutes } from "@/lib/portal/routes";

export async function ParentDashboard() {
  const context = await getMockParentPortalContext();

  if (!context) {
    return null;
  }

  const { parent, session } = context;
  const userName = session.user.name;
  const children = context.students;
  const [
    attendanceSummaries,
    allResults,
    allAnnouncements,
    invoices,
    payments,
    transportEntries,
  ] = await Promise.all([
    listAttendanceSummaries(),
    listResults(),
    listAnnouncements(),
    getParentInvoices(),
    getParentPayments(),
    getParentTransport(),
  ]);
  const childAttendance = attendanceSummaries.filter((item) =>
    parent.childIds.includes(item.studentId),
  );
  const combinedAttendance = childAttendance.length
    ? Math.round(
        childAttendance.reduce((total, item) => total + item.percentage, 0) /
          childAttendance.length,
      )
    : 0;
  const outstanding = invoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );
  const announcements = allAnnouncements.filter(
    (item) => item.audience === "all" || item.audience === "parent",
  );
  const transportEntry = transportEntries.find((item) => item.route);
  const route = transportEntry?.route ?? undefined;
  const trip = transportEntry?.latestTrip ?? undefined;

  const childRows: readonly DataTableRow[] = children.map((student) => {
    const attendance = attendanceSummaries.find(
      (item) => item.studentId === student.id,
    );
    const results = allResults.filter(
      (item) => item.studentId === student.id,
    );
    const average = results.length
      ? Math.round(
          results.reduce(
            (total, result) =>
              total + percentageScore(result.score, result.total),
            0,
          ) / results.length,
        )
      : 0;

    return {
      id: student.id,
      cells: [
        student.fullName,
        student.className,
        `${attendance?.percentage ?? 0}%`,
        results.length ? `${average}%` : "Pending",
      ],
    };
  });

  const paymentRows: readonly DataTableRow[] = payments
    .map((payment) => {
      const student = children.find((item) => item.id === payment.studentId);

      return {
        id: payment.id,
        cells: [
          student?.fullName ?? "Student",
          formatPortalDate(payment.paidAt.slice(0, 10)),
          formatPortalCurrency(payment.amount),
          <StatusBadge key={payment.id} variant="success">
            Successful
          </StatusBadge>,
        ],
      };
    });

  return (
    <>
      <DashboardHeader
        eyebrow="Family overview"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Monitor linked children, academic summaries, fee balances and school communication from one place."
        badge="Parent mock data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Linked children"
          value={String(children.length)}
          detail="Family profiles"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Outstanding fees"
          value={formatPortalCurrency(outstanding)}
          detail="Open fees for details"
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Attendance"
          value={`${combinedAttendance}%`}
          detail="Current attendance"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Children overview"
            description="Academic snapshots for linked fictional learners."
          >
            <DataTable
              caption="Linked children overview"
              columns={["Child", "Class", "Attendance", "Recent average"]}
              rows={childRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Fees snapshot"
            description="Review recent payments and open the grouped Fees area to pay or inspect balances."
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href={portalRoutes.parentFeesPay}
                className="inline-flex min-h-11 items-center rounded-full bg-curry-orange px-5 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
              >
                Pay now
              </Link>
              <Link
                href={portalRoutes.parentFees}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Open fees
              </Link>
            </div>
            <div className="mt-6">
              <DataTable
                caption="Recent parent payments"
                columns={["Student", "Date", "Amount", "Status"]}
                rows={paymentRows}
              />
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Recent notices">
            <NoticeList announcements={announcements} />
          </DashboardCard>

          <DashboardCard
            title="Transport preview"
            description="Latest manually updated mock trip status."
          >
            {route && trip ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-charcoal">{route.busName}</p>
                    <p className="text-sm text-muted-grey">{route.routeName}</p>
                  </div>
                  <StatusBadge variant="info">On route</StatusBadge>
                </div>
                <div className="rounded-2xl bg-soft-cream p-4 text-sm">
                  <p className="font-semibold text-charcoal">
                    Next stop: {trip.nextStop}
                  </p>
                  <p className="mt-1 text-muted-grey">
                    Updated {formatPortalTime(trip.lastUpdated.slice(11, 16))}
                  </p>
                </div>
                <Link
                  href={portalRoutes.parentTransport}
                  className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
                >
                  Open transport tracking
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-grey">
                No transport route is assigned.
              </p>
            )}
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
