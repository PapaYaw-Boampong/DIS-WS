import {
  Bus,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  MessageSquare,
  ReceiptText,
  Users,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { NoticeList } from "@/components/portal/NoticeList";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { QuickActionCard } from "@/components/portal/QuickActionCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  mockAttendance,
  mockResults,
} from "@/data/portal/academics";
import { mockAnnouncements, mockPortalEvents } from "@/data/portal/announcements";
import { mockInvoices } from "@/data/portal/fees";
import { mockParents } from "@/data/portal/parents";
import { mockPayments } from "@/data/portal/payments";
import { mockStudents } from "@/data/portal/students";
import {
  mockTransportRoutes,
  mockTransportTrips,
} from "@/data/portal/transport";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
  percentageScore,
} from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";

type ParentDashboardProps = {
  readonly userId: string;
  readonly userName: string;
};

export function ParentDashboard({
  userId,
  userName,
}: ParentDashboardProps) {
  const parent = mockParents.find((item) => item.userId === userId);

  if (!parent) {
    return null;
  }

  const children = mockStudents.filter((student) =>
    parent.childIds.includes(student.id),
  );
  const childAttendance = mockAttendance.filter((item) =>
    parent.childIds.includes(item.studentId),
  );
  const combinedAttendance = Math.round(
    childAttendance.reduce((total, item) => total + item.percentage, 0) /
      childAttendance.length,
  );
  const invoices = mockInvoices.filter((invoice) =>
    parent.childIds.includes(invoice.studentId),
  );
  const outstanding = invoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );
  const totalInvoiced = invoices.reduce(
    (total, invoice) => total + invoice.totalAmount,
    0,
  );
  const totalPaid = invoices.reduce(
    (total, invoice) => total + invoice.amountPaid,
    0,
  );
  const announcements = mockAnnouncements.filter(
    (item) => item.audience === "all" || item.audience === "parent",
  );
  const events = mockPortalEvents.filter(
    (item) => item.audience === "all" || item.audience === "parent",
  );
  const transportStudent = children.find((student) => student.transportRouteId);
  const route = mockTransportRoutes.find(
    (item) => item.id === transportStudent?.transportRouteId,
  );
  const trip = mockTransportTrips.find((item) => item.routeId === route?.id);

  const childRows: readonly DataTableRow[] = children.map((student) => {
    const attendance = mockAttendance.find(
      (item) => item.studentId === student.id,
    );
    const results = mockResults.filter(
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

  const paymentRows: readonly DataTableRow[] = mockPayments.map((payment) => {
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          detail="Combined current term"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Messages"
          value="3"
          detail="Mock unread count"
          icon={<MessageSquare aria-hidden="true" className="size-5" />}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-extrabold text-charcoal">
          Quick actions
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="My children"
            description="Open linked learner profiles and records."
            icon={<Users aria-hidden="true" className="size-5" />}
            statusLabel="Page planned"
          />
          <QuickActionCard
            title="Results"
            description="Review detailed assessment reports."
            icon={
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="size-5"
              />
            }
            statusLabel="Page planned"
          />
          <QuickActionCard
            title="Fees"
            description="Review invoices, balances and payment previews."
            icon={<ReceiptText aria-hidden="true" className="size-5" />}
            href={portalRoutes.parentFees}
          />
          <QuickActionCard
            title="Transport"
            description="Detailed trip tracking begins in Phase 4."
            icon={<Bus aria-hidden="true" className="size-5" />}
            statusLabel="Phase 4"
          />
        </div>
      </section>

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
            description="This is a read-only preview. Payment actions are not connected."
          >
            <ProgressMeter
              label="Invoice payment progress"
              value={
                totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0
              }
              detail={`${formatPortalCurrency(totalPaid)} paid of ${formatPortalCurrency(totalInvoiced)}`}
              tone="green"
            />
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
            description="Read-only mock status; tracking controls remain Phase 4."
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
              </div>
            ) : (
              <p className="text-sm text-muted-grey">
                No transport route is assigned.
              </p>
            )}
          </DashboardCard>

          <DashboardCard title="Upcoming events">
            <ul className="space-y-3">
              {events.map((event) => (
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
