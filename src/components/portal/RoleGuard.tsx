import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { getPortalNotifications } from "@/lib/portal/data/documents";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalLoginForRole, portalRoutes } from "@/lib/portal/routes";
import type { PortalRole } from "@/types/portal";

type RoleGuardProps = {
  readonly children: ReactNode;
  readonly role: PortalRole;
};

export async function RoleGuard({ children, role }: RoleGuardProps) {
  const session = await getMockPortalSession();

  if (!session) {
    redirect(portalLoginForRole(role));
  }

  if (session.user.role !== role) {
    redirect(portalRoutes.dashboard(session.user.role));
  }

  const notifications = await getPortalNotifications();

  return (
    <PortalLayout role={role} session={session} notifications={notifications}>
      {children}
    </PortalLayout>
  );
}
