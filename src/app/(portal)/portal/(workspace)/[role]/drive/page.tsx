import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDriverRoutes } from "@/app/(portal)/portal/actions/driving";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DriverLocationSharer } from "@/components/portal/DriverLocationSharer";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Share Bus Location" };

type DrivePageProps = {
  readonly params: Promise<{ role: string }>;
};

// The driver's page, opened on their phone at the start of a run. Deliberately
// one decision and one big button: it is used at the wheel, before setting off.
export default async function DrivePage({ params }: DrivePageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("transport.manage"))) {
    notFound();
  }

  const routes = await getDriverRoutes();

  return (
    <>
      <DashboardHeader
        eyebrow="Transport"
        title="Share bus location"
        description="Turn this on when you set off and off when the run is finished. Families with a child on your route can then see where the bus is."
        badge="Driver"
      />

      <div className="mt-8 max-w-xl">
        <DashboardCard
          title="Location sharing"
          description="Your phone provides the location. Nothing is shared until you start, and it stops the moment you do."
        >
          <DriverLocationSharer routes={routes} />
        </DashboardCard>
      </div>
    </>
  );
}
