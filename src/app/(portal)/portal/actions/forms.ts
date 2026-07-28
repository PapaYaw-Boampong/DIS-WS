"use server";

import { portalApiSend, useRealPortalAuth } from "@/lib/portal/data/api";
import { listMailingSignups } from "@/lib/portal/data/forms";
import { sendBroadcastEmail } from "@/lib/server/forms";

export type FormsActionResult = {
  readonly ok: boolean;
  readonly error?: string;
  readonly sent?: number;
};

export async function setMailingStatus(
  id: string,
  status: "active" | "unsubscribed",
): Promise<FormsActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiSend(
    "PATCH",
    `/mailing-list/${encodeURIComponent(id)}`,
    { status },
  );
  return { ok: result.ok, error: result.ok ? undefined : "save_failed" };
}

export async function updateInquiry(
  id: string,
  input: {
    readonly status?: "new" | "in_progress" | "resolved";
    readonly notes?: string;
  },
): Promise<FormsActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiSend(
    "PATCH",
    `/inquiries/${encodeURIComponent(id)}`,
    input,
  );
  return { ok: result.ok, error: result.ok ? undefined : "save_failed" };
}

// Sends an update to every active subscriber (via Resend). Returns a clear
// error when email delivery isn't configured yet.
export async function sendMailingBroadcast(
  subject: string,
  body: string,
): Promise<FormsActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  if (!subject.trim() || !body.trim()) {
    return { ok: false, error: "missing_content" };
  }
  const recipients = (await listMailingSignups())
    .filter((signup) => signup.status === "active")
    .map((signup) => signup.email);
  if (recipients.length === 0) {
    return { ok: false, error: "no_subscribers" };
  }
  try {
    const { sent } = await sendBroadcastEmail(subject, body, recipients);
    return { ok: true, sent };
  } catch (error) {
    const notConfigured =
      error instanceof Error &&
      error.message === "FORM_DELIVERY_NOT_CONFIGURED";
    return {
      ok: false,
      error: notConfigured ? "email_not_configured" : "send_failed",
    };
  }
}
