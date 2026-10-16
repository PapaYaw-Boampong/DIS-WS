import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bus, MapPin, Phone, Route, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { TransportStatusBadge } from "@/components/portal/TransportStatusBadge";
import { listStudents } from "@/lib/portal/data/students";
import {
  listTransportAssignments,
  listTransportRoutes,
  listTransportTrips,
} from "@/lib/portal/data/transport";
import { formatPortalTime } from "@/lib/portal/format";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Routes",
};

type TransportRoutesPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function TransportRoutesPage({
  params,
}: TransportRoutesPageProps) {
  const { role } = await params;

  // Route planning belongs to the transport office; school admin keeps a view.
  if (!isPortalRole(role) || (role !== "transport" && role !== "admin")) {
    notFound();
  }

  const [routes, trips, assignments, students] = await Promise.all([
    listTransportRoutes(),
    listTransportTrips(),
    listTransportAssignments(),
    listStudents(),
  ]);

  const totalCapacity = routes.reduce((total, item) => total + item.capacity, 0);
  const totalStops = routes.reduce(
    (total, item) => total + item.stops.length,
    0,
  );
  const unassignedDrivers = routes.filter((item) => !item.driverName).length;

  return (
    <>
      <DashboardHeader
        eyebrow="Transport operations"
        title="Routes"
        description="Every configured route with its bus, driver, stops and the learners assigned to it."
        badge="Route register"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Routes"
          value={String(routes.length)}
          detail="Configured routes"
          icon={<Route aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Seats"
          value={String(totalCapacity)}
          detail={`${assignments.length} assigned`}
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Stops"
          value={String(totalStops)}
          detail="Across all routes"
          icon={<MapPin aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Drivers"
          value={String(routes.length - unassignedDrivers)}
          detail={
            unassignedDrivers
              ? `${unassignedDrivers} route(s) unassigned`
              : "Every route has a driver"
          }
          icon={<Bus aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 space-y-6">
        {routes.map((route) => {
          const trip = trips.find((item) => item.routeId === route.id);
          const routeAssignments = assignments.filter(
            (item) => item.routeId === route.id,
          );
          const riderRows: readonly DataTableRow[] = routeAssignments.map(
            (assignment) => {
              const student = students.find(
                (item) => item.id === assignment.studentId,
              );

              return {
                id: assignment.id,
                cells: [
                  student?.fullName ?? assignment.studentId,
                  student?.className ?? "—",
                  assignment.pickupPoint,
                  formatPortalTime(assignment.estimatedPickupTime),
                  assignment.dropOffPoint,
                  formatPortalTime(assignment.estimatedDropOffTime),
                ],
              };
            },
          );

          return (
            <DashboardCard
              key={route.id}
              title={`${route.routeName} · ${route.busName}`}
              description={`${route.vehicleRegistration} · ${routeAssignments.length} of ${route.capacity} seats assigned`}
              action={
                trip ? <TransportStatusBadge status={trip.status} /> : undefined
              }
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-soft-white p-4">
                    <Bus
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-curry-orange"
                    />
                    <div>
                      <p className="font-bold text-charcoal">
                        {route.driverName ?? "Driver unassigned"}
                      </p>
                      {route.driverPhone ? (
                        <a
                          href={`tel:${route.driverPhone.replaceAll(" ", "")}`}
                          className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-deep-orange hover:underline"
                        >
                          <Phone aria-hidden="true" className="size-4" />
                          {route.driverPhone}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-muted-grey">
                          No driver contact on file.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-charcoal">
                      Stops in order
                    </p>
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
                </div>

                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Assigned learners
                  </p>
                  <div className="mt-3">
                    <DataTable
                      caption={`${route.routeName} assigned learners`}
                      columns={[
                        "Learner",
                        "Class",
                        "Pickup",
                        "Pickup time",
                        "Drop-off",
                        "Drop-off time",
                      ]}
                      rows={riderRows}
                      emptyMessage="No learners are assigned to this route yet."
                    />
                  </div>
                </div>
              </div>
            </DashboardCard>
          );
        })}

        {routes.length === 0 ? (
          <DashboardCard title="No routes configured">
            <p className="text-sm text-muted-grey">
              Add a route to start assigning buses, drivers and learners.
            </p>
          </DashboardCard>
        ) : null}
      </div>
    </>
  );
}
