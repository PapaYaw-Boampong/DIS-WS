import "server-only";

import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { PortalRole } from "@/types/portal";

export async function getMockRoleSession(role: PortalRole) {
  const session = await getMockPortalSession();

  return session?.user.role === role ? session : null;
}

export async function getMockAnyRoleSession(roles: readonly PortalRole[]) {
  const session = await getMockPortalSession();

  return session && roles.includes(session.user.role) ? session : null;
}

// Guard for a page in the administration area. `owners` are the split admin
// roles the page belongs to; the school administrator keeps access to all of
// them so one account can still run the whole portal.
export async function getAdminAreaSession(...owners: readonly PortalRole[]) {
  return getMockAnyRoleSession(["admin", ...owners]);
}
