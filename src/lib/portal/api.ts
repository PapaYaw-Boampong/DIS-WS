import "server-only";

import { isPortalRole } from "@/lib/portal/roles";
import { portalApiUrl } from "@/lib/portal/auth-config";
import type { PortalAccountStatus, PortalUser } from "@/types/portal";

type LoginResponse = {
  readonly token: string;
  readonly expiresAt: string;
  readonly user: PortalUser;
};

const accountStatuses: readonly PortalAccountStatus[] = [
  "active",
  "inactive",
  "suspended",
];

// The backend returns lowercase role/status strings; validate before trusting.
function toPortalUser(value: unknown): PortalUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value as Record<string, unknown>;
  const { id, name, email, role, status } = record;

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof role !== "string" ||
    typeof status !== "string" ||
    !isPortalRole(role) ||
    !accountStatuses.includes(status as PortalAccountStatus)
  ) {
    return null;
  }

  return {
    id,
    name,
    email,
    role,
    status: status as PortalAccountStatus,
    mustChangePassword: record.mustChangePassword === true,
  };
}

export type LoginOutcome =
  | { ok: true; token: string; user: PortalUser }
  // Password accepted, second factor outstanding. Nothing is signed in yet —
  // the challenge token only authorises submitting a code.
  | { ok: false; reason: "mfa_required"; challengeToken: string }
  | { ok: false; reason: "invalid_credentials" }
  // Too many failed attempts for this account or from this address. Told apart
  // from bad credentials so the sign-in page can explain the wait instead of
  // sending someone round the "check your password" loop forever.
  | { ok: false; reason: "throttled"; retryAfterSeconds: number };

export async function apiLogin(
  email: string,
  password: string,
): Promise<LoginOutcome> {
  try {
    const response = await fetch(`${portalApiUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (response.status === 429) {
      const data = (await response
        .json()
        .catch(() => ({}))) as { retryAfterSeconds?: number };
      return {
        ok: false,
        reason: "throttled",
        retryAfterSeconds: data.retryAfterSeconds ?? 900,
      };
    }

    if (!response.ok) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const data = (await response.json()) as Partial<LoginResponse> & {
      mfaRequired?: boolean;
      challengeToken?: string;
    };

    if (data.mfaRequired && typeof data.challengeToken === "string") {
      return {
        ok: false,
        reason: "mfa_required",
        challengeToken: data.challengeToken,
      };
    }

    const user = toPortalUser(data.user);

    if (typeof data.token !== "string" || !user) {
      return { ok: false, reason: "invalid_credentials" };
    }

    return { ok: true, token: data.token, user };
  } catch {
    return { ok: false, reason: "invalid_credentials" };
  }
}

// Redeem an MFA challenge for a real session.
export async function apiVerifyMfa(
  challengeToken: string,
  code: string,
): Promise<LoginOutcome> {
  try {
    const response = await fetch(`${portalApiUrl}/auth/mfa/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeToken, code }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, reason: "invalid_credentials" };
    }

    const data = (await response.json()) as Partial<LoginResponse>;
    const user = toPortalUser(data.user);

    if (typeof data.token !== "string" || !user) {
      return { ok: false, reason: "invalid_credentials" };
    }

    return { ok: true, token: data.token, user };
  } catch {
    return { ok: false, reason: "invalid_credentials" };
  }
}

export async function apiGetMe(token: string): Promise<PortalUser | null> {
  try {
    const response = await fetch(`${portalApiUrl}/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { user?: unknown };
    return toPortalUser(data.user);
  } catch {
    return null;
  }
}

export async function apiChangePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ token: string; user: PortalUser } | { error: string }> {
  try {
    const response = await fetch(`${portalApiUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as Partial<
      LoginResponse & { error: string }
    >;
    if (!response.ok) {
      return { error: data.error ?? "change_failed" };
    }
    const user = toPortalUser(data.user);
    if (typeof data.token !== "string" || !user) {
      return { error: "change_failed" };
    }
    return { token: data.token, user };
  } catch {
    return { error: "change_failed" };
  }
}

export async function apiLogout(token: string): Promise<void> {
  try {
    await fetch(`${portalApiUrl}/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // Best-effort: the local cookie is cleared regardless.
  }
}
