import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ParentTransportDashboard } from "@/components/portal/dashboards/ParentTransportDashboard";
import { TransportOperationsDashboard } from "@/components/portal/dashboards/TransportOperationsDashboard";
import { mockPortalUsers } from "@/data/portal/users";
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
    const admin = mockPortalUsers.find((user) => user.role === "admin");

    if (!admin) {
      notFound();
    }

    return (
      <TransportOperationsDashboard
        userName={admin.name}
        mode="admin"
      />
    );
  }

  notFound();
}
