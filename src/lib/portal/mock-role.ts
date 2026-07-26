import "server-only";

import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { PortalRole } from "@/types/portal";

export async function getMockRoleSession(role: PortalRole) {
  const session = await getMockPortalSession();

  return session?.user.role === role ? session : null;
}
