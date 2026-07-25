"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { mockPortalUsers } from "@/data/portal/users";
import { apiLogin, apiLogout } from "@/lib/portal/api";
import {
  PORTAL_SESSION_MAX_AGE,
  REAL_PORTAL_SESSION_COOKIE,
  useRealPortalAuth,
} from "@/lib/portal/auth-config";
import { MOCK_PORTAL_SESSION_COOKIE } from "@/lib/portal/mock-session";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

// Mock login: pick a demo account by role, no password. Used when
// USE_REAL_PORTAL_AUTH is off.
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
    maxAge: PORTAL_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(portalRoutes.dashboard(user.role));
}

// Real login: email + password against the backend service. Used when
// USE_REAL_PORTAL_AUTH is on.
export async function loginWithCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(`${portalRoutes.login}?error=invalid-credentials`);
  }

  const result = await apiLogin(email, password);

  if (!result) {
    redirect(`${portalRoutes.login}?error=invalid-credentials`);
  }

  const cookieStore = await cookies();
  cookieStore.set(REAL_PORTAL_SESSION_COOKIE, result.token, {
    httpOnly: true,
    maxAge: PORTAL_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(portalRoutes.dashboard(result.user.role));
}

export async function logoutMockPortalSession() {
  const cookieStore = await cookies();

  if (useRealPortalAuth) {
    const token = cookieStore.get(REAL_PORTAL_SESSION_COOKIE)?.value;
    if (token) {
      await apiLogout(token);
    }
    cookieStore.delete(REAL_PORTAL_SESSION_COOKIE);
  } else {
    cookieStore.delete(MOCK_PORTAL_SESSION_COOKIE);
  }

  redirect(portalRoutes.login);
}
