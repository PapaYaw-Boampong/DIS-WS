import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ParentTransportDashboard } from "@/components/portal/dashboards/ParentTransportDashboard";
import { TransportOperationsDashboard } from "@/components/portal/dashboards/TransportOperationsDashboard";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Transport",
};

type PortalTransportPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function PortalTransportPage({
  params,
}: PortalTransportPageProps) {
  const { role } = await params;

  if (role === "parent") {
    const context = await getMockParentPortalContext();

    if (!context) {
      notFound();
    }

    return <ParentTransportDashboard students={context.students} />;
  }

  if (role === "admin") {
    return <TransportOperationsDashboard mode="admin" />;
  }

  notFound();
}
