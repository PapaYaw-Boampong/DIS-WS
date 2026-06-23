import {
  AlertTriangle,
  Bus,
  CircleCheckBig,
  Route,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockTripStatusForm } from "@/components/portal/MockTripStatusForm";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import {
  mockTransportAssignments,
  mockTransportNotices,
  mockTransportRoutes,
  mockTransportTrips,
} from "@/data/portal/transport";
import {
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";

type TransportOperationsDashboardProps = {
  readonly userName: string;
  readonly mode: "admin" | "transport";
};

export function TransportOperationsDashboard({
  userName,
  mode,
}: TransportOperationsDashboardProps) {
  const activeTrips = mockTransportTrips.filter(
    (trip) => trip.status === "on_route" || trip.status === "delayed",
  ).length;
  const arrivedTrips = mockTransportTrips.filter(
    (trip) => trip.status === "arrived",
  ).length;
  const delayedTrips = mockTransportTrips.filter(
    (trip) => trip.status === "delayed",
  ).length;

  const routeRows: readonly DataTableRow[] = mockTransportRoutes.map(
    (route) => {
      const trip = mockTransportTrips.find(
        (item) => item.routeId === route.id,
      );
      const assignedStudents = mockTransportAssignments.filter(
        (item) => item.routeId === route.id,
      ).length;

      return {
        id: route.id,
        cells: [
          `${route.busName} · ${route.vehicleRegistration}`,
          route.routeName,
          route.driverName ?? "Unassigned",
          `${assignedStudents}/${route.capacity}`,
          trip ? (
            <TransportStatusBadge key={trip.id} status={trip.status} />
          ) : (
            "No trip"
          ),
          trip
            ? `${formatPortalTime(trip.lastUpdated.slice(11, 16))} · ${trip.currentLocationLabel ?? "No location"}`
            : "Not updated",
        ],
      };
    },
  );

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
        description="Monitor mock routes, assigned buses and manually updated trip status. No GPS or notification service is connected."
        badge="Manual status data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Routes"
          value={String(mockTransportRoutes.length)}
          detail="Configured mock routes"
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active trips"
          value={String(activeTrips)}
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
            title="Route and trip overview"
            description="Current values are fictional manually updated records."
          >
            <DataTable
              caption="Transport route overview"
              columns={[
                "Bus",
                "Route",
                "Driver",
                "Assigned / capacity",
                "Status",
                "Last update",
              ]}
              rows={routeRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Route cards"
            description="Operational details for each mock bus."
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {mockTransportRoutes.map((route) => {
                const trip = mockTransportTrips.find(
                  (item) => item.routeId === route.id,
                );

                return (
                  <article
                    key={route.id}
                    className="rounded-2xl border border-border bg-soft-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-charcoal">
                          {route.busName}
                        </p>
                        <p className="mt-1 text-sm text-muted-grey">
                          {route.routeName}
                        </p>
                      </div>
                      {trip ? (
                        <TransportStatusBadge status={trip.status} />
                      ) : null}
                    </div>
                    <dl className="mt-5 space-y-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-grey">Registration</dt>
                        <dd className="font-semibold text-charcoal">
                          {route.vehicleRegistration}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-grey">Driver</dt>
                        <dd className="text-right font-semibold text-charcoal">
                          {route.driverName}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-grey">Stops</dt>
                        <dd className="font-semibold text-charcoal">
                          {route.stops.length}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Manual trip update"
            description="Preview the control planned for a backend-connected transport workflow."
          >
            <MockTripStatusForm routes={mockTransportRoutes} />
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
                <p className="text-2xl font-extrabold text-charcoal">
                  {mockTransportAssignments.length}
                </p>
                <p className="text-sm text-muted-grey">
                  Mock student route assignment
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
