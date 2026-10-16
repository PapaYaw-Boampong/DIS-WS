import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertTriangle, Bus, CircleCheckBig, Clock3 } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { TripStatusForm } from "@/components/portal/TripStatusForm";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import {
  listTransportRoutes,
  listTransportTrips,
} from "@/lib/portal/data/transport";
import { formatPortalDate, formatPortalTime } from "@/lib/portal/format";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Trips",
};

type TransportTripsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function TransportTripsPage({
  params,
}: TransportTripsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || (role !== "transport" && role !== "admin")) {
    notFound();
  }

  const [routes, trips] = await Promise.all([
    listTransportRoutes(),
    listTransportTrips(),
  ]);

  const sorted = trips.toSorted((first, second) =>
    second.lastUpdated.localeCompare(first.lastUpdated),
  );
  const active = sorted.filter(
    (trip) => trip.status === "on_route" || trip.status === "delayed",
  );
  const arrived = sorted.filter((trip) => trip.status === "arrived").length;
  const delayed = sorted.filter((trip) => trip.status === "delayed").length;

  const tripRows: readonly DataTableRow[] = sorted.map((trip) => {
    const route = routes.find((item) => item.id === trip.routeId);

    return {
      id: trip.id,
      cells: [
        route ? `${route.busName} · ${route.routeName}` : trip.routeId,
        formatPortalDate(trip.date),
        trip.direction === "morning" ? "Morning pickup" : "Afternoon drop-off",
        <TransportStatusBadge key={`${trip.id}-status`} status={trip.status} />,
        trip.currentLocationLabel ?? "No location",
        trip.nextStop ?? "—",
        formatPortalTime(trip.lastUpdated.slice(11, 16)),
      ],
    };
  });

  return (
    <>
      <DashboardHeader
        eyebrow="Transport operations"
        title="Trips"
        description="Every morning and afternoon run, its current status and the last update recorded for it."
        badge="Manual status data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Trips today"
          value={String(sorted.length)}
          detail="Recorded runs"
          icon={<Bus aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(active.length)}
          detail="On route or delayed"
          icon={<Clock3 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Arrived"
          value={String(arrived)}
          detail="Completed at school"
          icon={<CircleCheckBig aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Delayed"
          value={String(delayed)}
          detail="Needs communication"
          icon={<AlertTriangle aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Trip log"
            description="Most recently updated first."
          >
            <DataTable
              caption="Transport trip log"
              columns={[
                "Bus / route",
                "Date",
                "Direction",
                "Status",
                "Location",
                "Next stop",
                "Updated",
              ]}
              rows={tripRows}
              emptyMessage="No trips have been recorded yet."
            />
          </DashboardCard>

          {active.length ? (
            <DashboardCard
              title="Currently on the road"
              description="Runs that have not reached their destination."
            >
              <div className="grid gap-5 md:grid-cols-2">
                {active.map((trip) => {
                  const route = routes.find((item) => item.id === trip.routeId);

                  return (
                    <article
                      key={trip.id}
                      className="rounded-2xl border border-border bg-soft-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-charcoal">
                            {route?.busName ?? "Bus"}
                          </p>
                          <p className="mt-1 text-sm text-muted-grey">
                            {route?.routeName ?? trip.routeId}
                          </p>
                        </div>
                        <TransportStatusBadge status={trip.status} />
                      </div>
                      <p className="mt-4 text-sm text-muted-grey">
                        At {trip.currentLocationLabel ?? "an unrecorded point"} ·
                        next stop {trip.nextStop ?? "not set"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-muted-grey">
                        Updated {formatPortalTime(trip.lastUpdated.slice(11, 16))}
                      </p>
                    </article>
                  );
                })}
              </div>
            </DashboardCard>
          ) : null}
        </div>

        <DashboardCard
          title="Update a trip"
          description="Record the status the transport office has confirmed by phone or radio."
          className="xl:h-fit"
        >
          <TripStatusForm routes={routes} />
        </DashboardCard>
      </div>
    </>
  );
}
