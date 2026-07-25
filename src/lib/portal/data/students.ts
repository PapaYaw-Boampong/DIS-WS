import "server-only";

import { cookies } from "next/headers";

import { mockStudents } from "@/data/portal/students";
import {
  portalApiUrl,
  REAL_PORTAL_SESSION_COOKIE,
  useRealPortalAuth,
} from "@/lib/portal/auth-config";
import type { StudentProfile } from "@/types/portal";

// Repository pattern: returns mock data when the real backend is disabled, and
// backend data (via the current session token) when it is enabled. Every portal
// domain page reads through a repo like this, so the flag flips the whole portal
// between mock and real without touching page components further.
export async function listStudents(): Promise<readonly StudentProfile[]> {
  if (!useRealPortalAuth) {
    return mockStudents;
  }

  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${portalApiUrl}/students`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { students?: StudentProfile[] };
    return data.students ?? [];
  } catch {
    return [];
  }
}
