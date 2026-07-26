"use server";

import {
  portalApiPost,
  portalApiSend,
  useRealPortalAuth,
} from "@/lib/portal/data/api";

export type ResetResult = {
  readonly ok: boolean;
  readonly tempPassword?: string;
  readonly error?: string;
};

// Admin-initiated password reset: returns the temporary password once, for the
// admin to relay to the user. The user is then forced to change it on sign-in.
export async function resetUserPassword(userId: string): Promise<ResetResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiPost<{ tempPassword?: string }>(
    `/admin/users/${encodeURIComponent(userId)}/reset-password`,
  );
  return result.ok
    ? { ok: true, tempPassword: result.data?.tempPassword }
    : { ok: false, error: "reset_failed" };
}

export async function setUserStatus(
  userId: string,
  status: "active" | "inactive" | "suspended",
): Promise<{ ok: boolean }> {
  if (!useRealPortalAuth) return { ok: false };
  const result = await portalApiSend(
    "PATCH",
    `/admin/users/${encodeURIComponent(userId)}`,
    { status },
  );
  return { ok: result.ok };
}
