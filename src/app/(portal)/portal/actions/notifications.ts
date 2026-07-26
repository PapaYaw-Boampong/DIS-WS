"use server";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";

export type NotificationActionResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
};

// Persist per-user read state. In mock mode these are no-ops (the client keeps
// its local read state, as before); in real mode they POST to the backend.
export async function setNotificationRead(
  id: string,
  read: boolean,
): Promise<NotificationActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const result = await portalApiPost(
    `/me/notifications/${encodeURIComponent(id)}/read`,
    { read },
  );
  return { ok: result.ok, mode: "real" };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const result = await portalApiPost("/me/notifications/read-all");
  return { ok: result.ok, mode: "real" };
}
