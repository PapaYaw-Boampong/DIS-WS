import { notFound } from "next/navigation";

import { RoleGuard } from "@/components/portal/RoleGuard";
import { isPortalRole } from "@/lib/portal/roles";

type PortalRoleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    role: string;
  }>;
}>;

export default async function PortalRoleLayout({
  children,
  params,
}: PortalRoleLayoutProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  return <RoleGuard role={role}>{children}</RoleGuard>;
}
