import Link from "next/link";
import {
  AlertTriangle,
  Bus,
  CircleCheckBig,
  Route,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { TripStatusForm } from "@/components/portal/TripStatusForm";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import { listTransportNotices } from "@/lib/portal/data/communication";
import {
  listTransportAssignments,
  listTransportRoutes,
  listTransportTrips,
} from "@/lib/portal/data/transport";
import {
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoutes } from "@/lib/portal/routes";

type TransportOperationsDashboardProps = {
  readonly mode: "admin" | "transport";
};

export async function TransportOperationsDashboard({
  mode,
}: TransportOperationsDashboardProps) {
  const session = await getMockPortalSession();
  const userName = session?.user.name ?? "Transport";
  const [
    mockTransportRoutes,
    mockTransportTrips,
    mockTransportAssignments,
    mockTransportNotices,
  ] = await Promise.all([
    listTransportRoutes(),
    listTransportTrips(),
    listTransportAssignments(),
    listTransportNotices(),
  ]);
  const activeTrips = mockTransportTrips.filter(
    (trip) => trip.status === "on_route" || trip.status === "delayed",
  );
  const arrivedTrips = mockTransportTrips.filter(
    (trip) => trip.status === "arrived",
  ).length;
  const delayedTrips = mockTransportTrips.filter(
    (trip) => trip.status === "delayed",
  ).length;

  return (
    <>
      <DashboardHeader
        eyebrow={
          mode === "admin" ? "Administrative oversight" : "Transport operations"
        }
        title={
          mode === "admin"
            ? "Transport overview"
            : `Welcome back, ${userName.split(" ")[0]}`
        }
        description="Today's picture at a glance. The full route register and trip log have their own pages."
        badge="Manual status data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Routes"
          value={String(mockTransportRoutes.length)}
          detail={`${mockTransportAssignments.length} learners assigned`}
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active trips"
          value={String(activeTrips.length)}
          detail="On route or delayed"
          icon={<Bus aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Arrived"
          value={String(arrivedTrips)}
          detail="Morning trips at school"
          icon={<CircleCheckBig aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Delayed"
          value={String(delayedTrips)}
          detail="Needs communication"
          icon={<AlertTriangle aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="On the road now"
            description="Runs that have not yet reached their destination."
            action={
              <Link
                href={portalRoutes.transportTrips(
                  mode === "admin" ? "admin" : "transport",
                )}
                className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
              >
                Open trips
              </Link>
            }
          >
            {activeTrips.length ? (
              <ul className="space-y-3">
                {activeTrips.map((trip) => {
                  const route = mockTransportRoutes.find(
                    (item) => item.id === trip.routeId,
                  );

                  return (
                    <li
                      key={trip.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-soft-white p-4"
                    >
                      <div>
                        <p className="font-bold text-charcoal">
                          {route?.busName ?? "Bus"} ·{" "}
                          {route?.routeName ?? trip.routeId}
                        </p>
                        <p className="mt-1 text-sm text-muted-grey">
                          {trip.currentLocationLabel ?? "No location"} · next{" "}
                          {trip.nextStop ?? "stop not set"} ·{" "}
                          {formatPortalTime(trip.lastUpdated.slice(11, 16))}
                        </p>
                      </div>
                      <TransportStatusBadge status={trip.status} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-grey">
                No bus is currently on the road.
              </p>
            )}
          </DashboardCard>

          <DashboardCard
            title="Transport office"
            description="Where the day-to-day records live."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href={portalRoutes.transportRoutes(
                  mode === "admin" ? "admin" : "transport",
                )}
                className="rounded-2xl border border-border bg-soft-white p-5 transition-colors hover:border-curry-orange/40"
              >
                <Route
                  aria-hidden="true"
                  className="size-5 text-curry-orange"
                />
                <p className="mt-3 font-bold text-charcoal">Routes</p>
                <p className="mt-1 text-sm text-muted-grey">
                  Buses, drivers, stops and assigned learners.
                </p>
              </Link>
              <Link
                href={portalRoutes.transportTrips(
                  mode === "admin" ? "admin" : "transport",
                )}
                className="rounded-2xl border border-border bg-soft-white p-5 transition-colors hover:border-curry-orange/40"
              >
                <Bus aria-hidden="true" className="size-5 text-curry-orange" />
                <p className="mt-3 font-bold text-charcoal">Trips</p>
                <p className="mt-1 text-sm text-muted-grey">
                  The full trip log and status updates.
                </p>
              </Link>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Manual trip update"
            description="Record a status confirmed by the driver."
          >
            <TripStatusForm routes={mockTransportRoutes} />
          </DashboardCard>

          <DashboardCard title="Transport notices">
            <ul className="space-y-3">
              {mockTransportNotices.map((notice) => (
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

          <DashboardCard title="Assignment summary">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <Users aria-hidden="true" className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-charcoal tabular-nums">
                  {mockTransportAssignments.length}
                </p>
                <p className="text-sm text-muted-grey">
                  Learners assigned to a route
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
