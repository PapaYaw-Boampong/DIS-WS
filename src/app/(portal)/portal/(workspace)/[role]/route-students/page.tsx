import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bus, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import {
  listTransportAssignments,
  listTransportRoutes,
} from "@/lib/portal/data/transport";
import { listStudents } from "@/lib/portal/data/students";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Transport Students" };

type TransportStudentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

/**
 * Who is on which bus. This replaces a nav entry that had been sitting there
 * disabled — the data already existed, it simply had no page.
 */
export default async function TransportStudentsPage({
  params,
}: TransportStudentsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("transport.manage"))) {
    notFound();
  }

  const [assignments, routes, students] = await Promise.all([
    listTransportAssignments(),
    listTransportRoutes(),
    listStudents(),
  ]);

  const routeName = (id: string) => {
    const route = routes.find((item) => item.id === id);
    return route ? `${route.busName} · ${route.routeName}` : "Unassigned route";
  };

  const rows: readonly DataTableRow[] = assignments
    .map((assignment) => {
      const student = students.find((item) => item.id === assignment.studentId);
      const name = student?.fullName ?? assignment.studentId;

      return {
        id: assignment.id,
        name,
        cells: [
          name,
          student?.className ?? "—",
          routeName(assignment.routeId),
          assignment.pickupPoint,
          assignment.estimatedPickupTime,
          assignment.dropOffPoint,
          assignment.estimatedDropOffTime,
        ],
      };
    })
    .toSorted((first, second) => first.name.localeCompare(second.name));

  return (
    <>
      <DashboardHeader
        eyebrow="Transport"
        title="Students on transport"
        description="Every learner assigned to a bus, with their pickup and drop-off points."
        badge="Route rosters"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Learners"
          value={String(assignments.length)}
          detail="Assigned to a route"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Routes"
          value={String(routes.length)}
          detail="Buses in service"
          icon={<Bus aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Average per bus"
          value={
            routes.length > 0
              ? String(Math.round(assignments.length / routes.length))
              : "0"
          }
          detail="Learners per route"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8">
        <DashboardCard
          title="Route rosters"
          description="Used at the roadside to check who should be on board."
        >
          <DataTable
            caption="Students assigned to transport"
            columns={[
              "Learner",
              "Class",
              "Route",
              "Pickup",
              "Pickup time",
              "Drop-off",
              "Drop-off time",
            ]}
            rows={rows}
          />
        </DashboardCard>
      </div>
    </>
  );
}
