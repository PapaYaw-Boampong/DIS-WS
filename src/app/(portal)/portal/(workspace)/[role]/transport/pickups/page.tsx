import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ParentTransportDashboard } from "@/components/portal/dashboards/ParentTransportDashboard";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Pickups and Drops",
};

type TransportPickupsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function TransportPickupsPage({
  params,
}: TransportPickupsPageProps) {
  const { role } = await params;

  if (role !== "parent") {
    notFound();
  }

  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  return (
    <ParentTransportDashboard students={context.students} section="pickups" />
  );
}
