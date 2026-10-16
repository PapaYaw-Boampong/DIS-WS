import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import {
  defaultCapabilityMatrix,
  parseCapabilityMatrix,
  type CapabilityMatrix,
  type PortalCapability,
} from "@/lib/portal/capabilities";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { portalRoles, type PortalRole } from "@/types/portal";

// Developer-set role permissions.
//
// With a backend, the matrix lives in the database and is enforced there too —
// revoking a capability actually stops the write, it does not just hide the
// button. Without one (mock mode) the edited matrix lives in a cookie so it
// still survives navigation for that browser.
export const CAPABILITY_COOKIE = "dis_portal_capabilities";

// Deduped per render pass: a page can ask several times (guard, navigation,
// action buttons) and should not make several round trips for it.
export const getCapabilityMatrix = cache(
  async (): Promise<CapabilityMatrix> => {
    if (useRealPortalAuth) {
      const { matrix } = await portalApiGet<{ matrix?: Partial<CapabilityMatrix> }>(
        "/permissions",
        { matrix: defaultCapabilityMatrix },
      );

      // Any role the backend does not know about keeps its shipped defaults,
      // so a portal build ahead of the server still renders correctly.
      const merged = { ...defaultCapabilityMatrix };
      for (const role of portalRoles) {
        const capabilities = matrix?.[role];
        if (capabilities) merged[role] = capabilities;
      }
      return merged;
    }

    const stored = (await cookies()).get(CAPABILITY_COOKIE)?.value;
    return parseCapabilityMatrix(stored);
  },
);

export async function getRoleCapabilities(
  role: PortalRole,
): Promise<readonly PortalCapability[]> {
  return (await getCapabilityMatrix())[role] ?? defaultCapabilityMatrix[role];
}

export async function roleHasCapability(
  role: PortalRole,
  capability: PortalCapability,
): Promise<boolean> {
  return (await getRoleCapabilities(role)).includes(capability);
}

/**
 * Guard for a page that a capability protects: returns the session only when
 * the signed-in role currently holds the capability.
 */
export async function getCapableSession(capability: PortalCapability) {
  const session = await getMockPortalSession();

  if (!session) {
    return null;
  }

  return (await roleHasCapability(session.user.role, capability))
    ? session
    : null;
}
