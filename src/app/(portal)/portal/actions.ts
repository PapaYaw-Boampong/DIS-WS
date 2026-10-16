"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { mockPortalUsers } from "@/data/portal/users";
import {
  apiChangePassword,
  apiLogin,
  apiLogout,
  apiVerifyMfa,
} from "@/lib/portal/api";
import {
  PORTAL_SESSION_MAX_AGE,
  MFA_CHALLENGE_COOKIE,
  mockPortalAuthAllowed,
  REAL_PORTAL_SESSION_COOKIE,
  useRealPortalAuth,
} from "@/lib/portal/auth-config";
import { MOCK_PORTAL_SESSION_COOKIE } from "@/lib/portal/mock-session";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

// Mock login: pick a demo account by role, no password. Used when
// USE_REAL_PORTAL_AUTH is off.
export async function loginWithMockAccount(formData: FormData) {
  // Defence in depth: the sign-in page already hides this form in production,
  // but the server action is directly postable, so it refuses here too.
  if (!mockPortalAuthAllowed) {
    redirect(`${portalRoutes.login}?error=unavailable`);
  }

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

  if (!result.ok) {
    // Password was right but a second factor is outstanding. The challenge
    // lives in a short-lived httpOnly cookie rather than the URL, so it never
    // lands in browser history, logs or a shared link.
    if (result.reason === "mfa_required") {
      const jar = await cookies();
      jar.set(MFA_CHALLENGE_COOKIE, result.challengeToken, {
        httpOnly: true,
        maxAge: 5 * 60,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      redirect(portalRoutes.verifyCode);
    }
    if (result.reason === "throttled") {
      const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
      redirect(`${portalRoutes.login}?error=too-many-attempts&minutes=${minutes}`);
    }
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

  if (result.user.mustChangePassword) {
    redirect(portalRoutes.changePassword);
  }
  redirect(portalRoutes.dashboard(result.user.role));
}

// Second step of a two-factor sign-in: exchange the challenge for a session.
export async function verifyMfaCode(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const jar = await cookies();
  const challengeToken = jar.get(MFA_CHALLENGE_COOKIE)?.value;

  if (!challengeToken) {
    redirect(`${portalRoutes.login}?error=challenge-expired`);
  }
  if (!code) {
    redirect(`${portalRoutes.verifyCode}?error=invalid-code`);
  }

  const result = await apiVerifyMfa(challengeToken, code);

  if (!result.ok) {
    redirect(`${portalRoutes.verifyCode}?error=invalid-code`);
  }

  // One challenge buys one session; clear it either way.
  jar.delete(MFA_CHALLENGE_COOKIE);
  jar.set(REAL_PORTAL_SESSION_COOKIE, result.token, {
    httpOnly: true,
    maxAge: PORTAL_SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (result.user.mustChangePassword) {
    redirect(portalRoutes.changePassword);
  }
  redirect(portalRoutes.dashboard(result.user.role));
}

// Signed-in user sets a new password (used after an admin reset forces a
// change). The backend rotates the session token, so we refresh the cookie.
export async function changePortalPassword(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!useRealPortalAuth) {
    redirect(portalRoutes.login);
  }
  if (newPassword.length < 8) {
    redirect(`${portalRoutes.changePassword}?error=too-short`);
  }
  if (newPassword !== confirmPassword) {
    redirect(`${portalRoutes.changePassword}?error=mismatch`);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    redirect(portalRoutes.login);
  }

  const result = await apiChangePassword(token!, currentPassword, newPassword);
  if ("error" in result) {
    const code =
      result.error === "invalid_credentials"
        ? "current"
        : result.error === "password_unchanged"
          ? "reuse"
          : "failed";
    redirect(`${portalRoutes.changePassword}?error=${code}`);
  }

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
