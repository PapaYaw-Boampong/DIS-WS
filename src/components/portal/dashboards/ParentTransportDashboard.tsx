import { Bus, MapPin, Phone, UserRound } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MockTransportPreferenceForm } from "@/components/portal/MockTransportPreferenceForm";
import { LiveBusPosition } from "@/components/portal/LiveBusPosition";
import { TransportMapPreview } from "@/components/portal/TransportMapPreview";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import { TripTimeline } from "@/components/portal/TripTimeline";
import { listTransportNotices } from "@/lib/portal/data/communication";
import { listFeeItems } from "@/lib/portal/data/finance";
import {
  getParentInvoices,
  getParentPayments,
  getParentTransport,
} from "@/lib/portal/data/parent";
import {
  formatPortalCurrency,
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";
import type { StudentProfile } from "@/types/portal";

// The parent transport area is split into three tabs; each one renders through
// this component with the same resolved assignment, route and trip data.
export type ParentTransportSection = "tracking" | "general" | "pickups";

type ParentTransportDashboardProps = {
  readonly students: readonly StudentProfile[];
  readonly section?: ParentTransportSection;
};

const sectionCopy: Record<
  ParentTransportSection,
  { readonly title: string; readonly description: string }
> = {
  tracking: {
    title: "Transport tracking",
    description:
      "Follow today's trip on the route map and see where the bus is now.",
  },
  general: {
    title: "Transport details",
    description:
      "Your assigned bus, driver contact, route stops, notices and transport fee status.",
  },
  pickups: {
    title: "Pickups and drops",
    description:
      "The approved pickup and drop-off points for your child, and how to request a change.",
  },
};

export async function ParentTransportDashboard({
  students,
  section = "tracking",
}: ParentTransportDashboardProps) {
  const [transportEntries, invoices, payments, feeItems, transportNotices] =
    await Promise.all([
      getParentTransport(),
      getParentInvoices(),
      getParentPayments(),
      listFeeItems(),
      listTransportNotices(),
    ]);

  const entry =
    transportEntries.find((item) =>
      students.some((student) => student.id === item.assignment.studentId),
    ) ?? transportEntries[0];
  const assignment = entry?.assignment;
  const student = students.find((item) => item.id === assignment?.studentId);
  const route = entry?.route ?? undefined;
  const trip = entry?.latestTrip ?? undefined;
  const invoice = invoices.find(
    (item) => item.studentId === assignment?.studentId,
  );
  const transportFeeItem = feeItems.find(
    (item) =>
      item.category === "transport" && invoice?.feeItemIds.includes(item.id),
  );
  const transportPaid = payments
    .filter(
      (payment) =>
        payment.studentId === assignment?.studentId &&
        payment.category === "transport" &&
        payment.status === "verified",
    )
    .reduce((total, payment) => total + payment.amount, 0);
  const transportBalance = Math.max(
    0,
    (transportFeeItem?.amount ?? 0) - transportPaid,
  );
  const notices = transportNotices.filter(
    (notice) => !notice.routeId || notice.routeId === route?.id,
  );
  const copy = sectionCopy[section];

  if (!assignment || !student || !route || !trip) {
    return (
      <>
        <DashboardHeader
          eyebrow="School transport"
          title={copy.title}
          description="No transport assignment is available for the linked children."
        />
        <DashboardCard title="No assigned route" className="mt-8">
          <p className="text-sm leading-6 text-muted-grey">
            Contact the school transport office to add a child to a route.
          </p>
        </DashboardCard>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        eyebrow={`${student.fullName} · ${route.routeName}`}
        title={copy.title}
        description={copy.description}
        badge="Route tracking"
      />

      {section === "tracking" ? (
        <>
          <div className="mt-8 space-y-8">
            <DashboardCard
              title="Live tracking map"
              description="A diagram of the route's stops. When a tracker is fitted to the bus, its live position is shown below the diagram."
            >
              <TransportMapPreview route={route} trip={trip} />
              <div className="mt-4">
                <LiveBusPosition trip={trip} busName={route.busName} />
              </div>
            </DashboardCard>

            <DashboardCard
              title="Current trip"
              description="Trip status is set by the transport office. Position comes from the bus tracker when one is fitted."
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
          </div>
        </>
      ) : null}

      {section === "general" ? (
        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
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

            <DashboardCard title="Transport notices">
              {notices.length ? (
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
              ) : (
                <p className="text-sm text-muted-grey">
                  There are no transport notices for your route right now.
                </p>
              )}
            </DashboardCard>
          </div>

          <div className="space-y-8">
            <DashboardCard
              title="Transport fee status"
              description="The termly transport charge for this route."
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

            <DashboardCard title="Bus and driver">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-grey">Bus</dt>
                  <dd className="font-semibold text-charcoal">
                    {route.busName}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-grey">Registration</dt>
                  <dd className="font-semibold text-charcoal">
                    {route.vehicleRegistration}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-grey">Driver</dt>
                  <dd className="text-right font-semibold text-charcoal">
                    {route.driverName ?? "Unassigned"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-grey">Stops on route</dt>
                  <dd className="font-semibold text-charcoal">
                    {route.stops.length}
                  </dd>
                </div>
              </dl>
            </DashboardCard>
          </div>
        </div>
      ) : null}

      {section === "pickups" ? (
        <div className="mt-8 space-y-8">
          <DashboardCard
            title="Pickup and drop-off details"
            description={`Approved points for ${student.fullName}.`}
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

          <DashboardCard
            title="Request a different stop"
            description="Parents can choose preferred route stops locally. Production changes require transport-office approval."
          >
            <MockTransportPreferenceForm
              stops={route.stops}
              defaultPickup={assignment.pickupPoint}
              defaultDropOff={assignment.dropOffPoint}
            />
          </DashboardCard>
        </div>
      ) : null}
    </>
  );
}
