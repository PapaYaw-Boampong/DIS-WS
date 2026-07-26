import "server-only";

import { cookies } from "next/headers";

import {
  portalApiUrl,
  REAL_PORTAL_SESSION_COOKIE,
  useRealPortalAuth,
} from "@/lib/portal/auth-config";

export { useRealPortalAuth };

// Server-to-server GET to the portal backend using the current session token.
// Returns `fallback` on any missing token / non-OK / network error so pages
// degrade gracefully rather than throwing.
export async function portalApiGet<T>(path: string, fallback: T): Promise<T> {
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    return fallback;
  }
  try {
    const response = await fetch(`${portalApiUrl}${path}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

// Server-to-server POST (mutations) using the current session token. Returns a
// discriminated result rather than throwing so callers/server-actions can report
// success or failure without a try/catch.
export async function portalApiPost<T = unknown>(
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data?: T }> {
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, status: 401 };
  }
  try {
    // Only claim a JSON content-type when a body is actually sent — Fastify
    // rejects an empty body under `content-type: application/json` with a
    // 400 (FST_ERR_CTP_EMPTY_JSON_BODY) before the route handler ever runs.
    const headers: Record<string, string> = { authorization: `Bearer ${token}` };
    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }
    const response = await fetch(`${portalApiUrl}${path}`, {
      method: "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    let data: T | undefined;
    try {
      data = (await response.json()) as T;
    } catch {
      data = undefined;
    }
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0 };
  }
}

// Server-to-server PATCH/DELETE using the current session token, mirroring
// portalApiPost's discriminated-result contract.
export async function portalApiSend<T = unknown>(
  method: "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data?: T }> {
  const token = (await cookies()).get(REAL_PORTAL_SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, status: 401 };
  }
  try {
    const headers: Record<string, string> = { authorization: `Bearer ${token}` };
    if (body !== undefined) {
      headers["content-type"] = "application/json";
    }
    const response = await fetch(`${portalApiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    let data: T | undefined;
    try {
      data = (await response.json()) as T;
    } catch {
      data = undefined;
    }
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0 };
  }
}
