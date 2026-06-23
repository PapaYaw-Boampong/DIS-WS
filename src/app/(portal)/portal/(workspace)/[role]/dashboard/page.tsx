import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountsDashboard } from "@/components/portal/dashboards/AccountsDashboard";
import { AdminDashboard } from "@/components/portal/dashboards/AdminDashboard";
import { FoundationDashboard } from "@/components/portal/dashboards/FoundationDashboard";
import { ParentDashboard } from "@/components/portal/dashboards/ParentDashboard";
import { StaffDashboard } from "@/components/portal/dashboards/StaffDashboard";
import { StudentDashboard } from "@/components/portal/dashboards/StudentDashboard";
import { mockPortalUsers } from "@/data/portal/users";
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

  const user = mockPortalUsers.find((item) => item.role === role);

  if (!user) {
    notFound();
  }

  switch (role) {
    case "student":
      return <StudentDashboard userId={user.id} userName={user.name} />;
    case "parent":
      return <ParentDashboard userId={user.id} userName={user.name} />;
    case "staff":
      return <StaffDashboard userId={user.id} userName={user.name} />;
    case "admin":
      return <AdminDashboard userName={user.name} />;
    case "accounts":
      return <AccountsDashboard userName={user.name} />;
    case "transport":
      return <FoundationDashboard role={role} />;
  }
}
