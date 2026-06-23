import {
  Bus,
  Clock3,
  MapPin,
  Phone,
  Route,
  UserRound,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import { TripTimeline } from "@/components/portal/TripTimeline";
import { mockFeeItems, mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import {
  mockTransportAssignments,
  mockTransportNotices,
  mockTransportRoutes,
  mockTransportTrips,
} from "@/data/portal/transport";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";
import type { StudentProfile } from "@/types/portal";

type ParentTransportDashboardProps = {
  readonly students: readonly StudentProfile[];
};

export function ParentTransportDashboard({
  students,
}: ParentTransportDashboardProps) {
  const assignment = mockTransportAssignments.find((item) =>
    students.some((student) => student.id === item.studentId),
  );
  const student = students.find(
    (item) => item.id === assignment?.studentId,
  );
  const route = mockTransportRoutes.find(
    (item) => item.id === assignment?.routeId,
  );
  const trip = mockTransportTrips.find(
    (item) => item.routeId === assignment?.routeId,
  );
  const invoice = mockInvoices.find(
    (item) => item.studentId === assignment?.studentId,
  );
  const transportFeeItem = mockFeeItems.find(
    (item) =>
      item.category === "transport" &&
      invoice?.feeItemIds.includes(item.id),
  );
  const transportPaid = mockPayments
    .filter(
      (payment) =>
        payment.studentId === assignment?.studentId &&
        payment.category === "transport" &&
        payment.status === "successful",
    )
    .reduce((total, payment) => total + payment.amount, 0);
  const transportBalance = Math.max(
    0,
    (transportFeeItem?.amount ?? 0) - transportPaid,
  );
  const notices = mockTransportNotices.filter(
    (notice) => !notice.routeId || notice.routeId === route?.id,
  );

  if (!assignment || !student || !route || !trip) {
    return (
      <>
        <DashboardHeader
          eyebrow="School transport"
          title="Transport tracking"
          description="No mock transport assignment is available for the linked children."
        />
        <DashboardCard title="No assigned route" className="mt-8">
          <p className="text-sm leading-6 text-muted-grey">
            Contact the school transport office when production transport
            records are available.
          </p>
        </DashboardCard>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        eyebrow={`${student.fullName} · ${route.routeName}`}
        title="Transport tracking"
        description="Review the assigned bus, pickup and drop-off details, manually updated trip status and transport fee summary."
        badge="Manual mock tracking"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Assigned bus"
          value={route.busName}
          detail={route.vehicleRegistration}
          icon={<Bus aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Trip status"
          value={trip.status === "on_route" ? "On Route" : "Updated"}
          detail={`As of ${formatPortalTime(trip.lastUpdated.slice(11, 16))}`}
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Pickup time"
          value={formatPortalTime(assignment.estimatedPickupTime)}
          detail={assignment.pickupPoint}
          icon={<Clock3 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Transport balance"
          value={formatPortalCurrency(transportBalance)}
          detail="Mock fee balance"
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Current trip"
            description="Status is manually maintained mock data, not live GPS."
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <TransportStatusBadge status={trip.status} />
                <p className="mt-5 text-2xl font-extrabold text-charcoal">
                  {trip.currentLocationLabel ?? "Location not provided"}
                </p>
                <p className="mt-2 text-sm text-muted-grey">
                  Next stop: {trip.nextStop ?? "No next stop"}
                </p>
                <p className="mt-1 text-xs text-muted-grey">
                  Last updated {formatPortalDate(trip.date)} at{" "}
                  {formatPortalTime(trip.lastUpdated.slice(11, 16))}
                </p>
              </div>
              <div className="rounded-2xl bg-soft-cream p-5 sm:min-w-64">
                <p className="text-xs font-bold tracking-[0.12em] text-deep-orange uppercase">
                  Direction
                </p>
                <p className="mt-2 font-bold text-charcoal">
                  {trip.direction === "morning"
                    ? "Morning pickup"
                    : "Afternoon drop-off"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-grey">
                  Tracking is based on manual school updates.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <TripTimeline status={trip.status} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Pickup and drop-off details"
            description="Approved mock assignment details for the linked child."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-soft-white p-5">
                <MapPin
                  aria-hidden="true"
                  className="size-5 text-curry-orange"
                />
                <p className="mt-4 text-sm font-bold text-muted-grey">
                  Pickup point
                </p>
                <p className="mt-1 font-bold text-charcoal">
                  {assignment.pickupPoint}
                </p>
                <p className="mt-2 text-sm text-muted-grey">
                  Estimated {formatPortalTime(assignment.estimatedPickupTime)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-soft-white p-5">
                <MapPin
                  aria-hidden="true"
                  className="size-5 text-curry-orange"
                />
                <p className="mt-4 text-sm font-bold text-muted-grey">
                  Drop-off point
                </p>
                <p className="mt-1 font-bold text-charcoal">
                  {assignment.dropOffPoint}
                </p>
                <p className="mt-2 text-sm text-muted-grey">
                  Estimated {formatPortalTime(assignment.estimatedDropOffTime)}
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Assigned route">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <Bus aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="font-bold text-charcoal">
                  {route.busName} · {route.routeName}
                </p>
                <p className="mt-1 text-sm text-muted-grey">
                  {route.vehicleRegistration} · Capacity {route.capacity}
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-soft-white p-4">
              <UserRound
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-curry-orange"
              />
              <div>
                <p className="font-bold text-charcoal">{route.driverName}</p>
                {route.driverPhone ? (
                  <a
                    href={`tel:${route.driverPhone.replaceAll(" ", "")}`}
                    className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-deep-orange hover:underline"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                    {route.driverPhone}
                  </a>
                ) : null}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-bold text-charcoal">Route stops</p>
              <ol className="mt-3 space-y-2 text-sm text-muted-grey">
                {route.stops.map((stop, index) => (
                  <li key={stop} className="flex gap-3">
                    <span className="font-bold text-curry-orange">
                      {index + 1}.
                    </span>
                    {stop}
                  </li>
                ))}
              </ol>
            </div>
          </DashboardCard>

          <DashboardCard
            title="Transport fee status"
            description="Financial records remain mock data."
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-grey">Term charge</p>
                <p className="mt-1 text-2xl font-extrabold text-charcoal">
                  {formatPortalCurrency(transportFeeItem?.amount ?? 0)}
                </p>
              </div>
              <FinancialStatusBadge status={assignment.feeStatus} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-soft-white p-4">
                <p className="text-xs font-bold text-muted-grey uppercase">
                  Paid
                </p>
                <p className="mt-2 font-extrabold text-charcoal">
                  {formatPortalCurrency(transportPaid)}
                </p>
              </div>
              <div className="rounded-2xl bg-soft-white p-4">
                <p className="text-xs font-bold text-muted-grey uppercase">
                  Balance
                </p>
                <p className="mt-2 font-extrabold text-charcoal">
                  {formatPortalCurrency(transportBalance)}
                </p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Transport notices">
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li
                  key={notice.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <p className="font-bold text-charcoal">{notice.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-grey">
                    {notice.description}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-muted-grey">
                    {formatPortalDate(notice.publishedAt)}
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
