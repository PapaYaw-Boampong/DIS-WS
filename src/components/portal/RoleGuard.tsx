import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { getPortalNotifications } from "@/lib/portal/data/documents";
import {
  filterNavigationByCapabilities,
  portalNavigation,
} from "@/lib/portal/navigation";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { getRoleCapabilities } from "@/lib/portal/permissions";
import { portalPreviewMode } from "@/lib/portal/preview";
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

  // After an admin password reset the user must set a new password before using
  // the portal. The change-password page lives outside this guard, so no loop.
  if (session.user.mustChangePassword) {
    redirect(portalRoutes.changePassword);
  }

  const [notifications, capabilities] = await Promise.all([
    getPortalNotifications(),
    getRoleCapabilities(role),
  ]);
  // The sidebar reflects what this role may currently do, so revoking a
  // capability in the developer portal also hides its pages.
  const navigation = filterNavigationByCapabilities(
    portalNavigation[role],
    capabilities,
  );

  return (
    <PortalLayout
      role={role}
      session={session}
      notifications={notifications}
      navigation={navigation}
      preview={portalPreviewMode}
    >
      {children}
    </PortalLayout>
  );
}
