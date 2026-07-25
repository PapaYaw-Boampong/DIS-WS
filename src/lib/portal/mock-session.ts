import "server-only";

import { cookies } from "next/headers";

import { mockPortalUsers } from "@/data/portal/users";
import { useRealPortalAuth } from "@/lib/portal/auth-config";
import { getRealPortalSession } from "@/lib/portal/real-session";
import type { MockPortalSession } from "@/types/portal";

export const MOCK_PORTAL_SESSION_COOKIE = "dis_mock_portal_session";

// Single entry point for the current portal session. When real auth is enabled
// it reads the backend session; otherwise it falls back to the mock cookie. All
// callers (RoleGuard, role/parent helpers, dashboards) go through this.
export async function getMockPortalSession(): Promise<MockPortalSession | null> {
  if (useRealPortalAuth) {
    return getRealPortalSession();
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get(MOCK_PORTAL_SESSION_COOKIE)?.value;

  if (!userId) {
    return null;
  }

  const user = mockPortalUsers.find(
    (candidate) => candidate.id === userId && candidate.status === "active",
  );

  return user ? { user, mode: "mock" } : null;
}
