import "server-only";

import { cookies } from "next/headers";

import { mockPortalUsers } from "@/data/portal/users";
import type { MockPortalSession } from "@/types/portal";

export const MOCK_PORTAL_SESSION_COOKIE = "dis_mock_portal_session";

export async function getMockPortalSession(): Promise<MockPortalSession | null> {
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
