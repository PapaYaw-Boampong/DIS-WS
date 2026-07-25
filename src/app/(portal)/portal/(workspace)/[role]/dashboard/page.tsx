import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountsDashboard } from "@/components/portal/dashboards/AccountsDashboard";
import { AdminDashboard } from "@/components/portal/dashboards/AdminDashboard";
import { ParentDashboard } from "@/components/portal/dashboards/ParentDashboard";
import { StaffDashboard } from "@/components/portal/dashboards/StaffDashboard";
import { StudentDashboard } from "@/components/portal/dashboards/StudentDashboard";
import { TransportOperationsDashboard } from "@/components/portal/dashboards/TransportOperationsDashboard";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PortalDashboardPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function PortalDashboardPage({
  params,
}: PortalDashboardPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  switch (role) {
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "staff":
      return <StaffDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "accounts":
      return <AccountsDashboard />;
    case "transport":
      return <TransportOperationsDashboard mode="transport" />;
  }
}
