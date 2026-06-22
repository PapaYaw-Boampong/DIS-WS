"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { mockPortalUsers } from "@/data/portal/users";
import {
  MOCK_PORTAL_SESSION_COOKIE,
} from "@/lib/portal/mock-session";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export async function loginWithMockAccount(formData: FormData) {
  const roleValue = formData.get("role");

  if (typeof roleValue !== "string" || !isPortalRole(roleValue)) {
    redirect(`${portalRoutes.login}?error=invalid-role`);
  }

  const user = mockPortalUsers.find(
    (candidate) =>
      candidate.role === roleValue && candidate.status === "active",
  );

  if (!user) {
    redirect(`${portalRoutes.login}?error=account-unavailable`);
  }

  const cookieStore = await cookies();
  cookieStore.set(MOCK_PORTAL_SESSION_COOKIE, user.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(portalRoutes.dashboard(user.role));
}

export async function logoutMockPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_PORTAL_SESSION_COOKIE);
  redirect(portalRoutes.login);
}
