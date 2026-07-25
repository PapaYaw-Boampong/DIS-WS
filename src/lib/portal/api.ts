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
  };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: PortalUser } | null> {
  try {
    const response = await fetch(`${portalApiUrl}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<LoginResponse>;
    const user = toPortalUser(data.user);

    if (typeof data.token !== "string" || !user) {
      return null;
    }

    return { token: data.token, user };
  } catch {
    return null;
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
