import "server-only";

import { cookies } from "next/headers";

import { apiGetMe } from "@/lib/portal/api";
import { REAL_PORTAL_SESSION_COOKIE } from "@/lib/portal/auth-config";
import type { MockPortalSession } from "@/types/portal";

export async function getRealPortalSession(): Promise<MockPortalSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REAL_PORTAL_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const user = await apiGetMe(token);
  return user ? { user, mode: "real" } : null;
}
