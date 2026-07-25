"use server";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";

export type SendMessageResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly error?: string;
};

// Sends a reply into a conversation. In mock mode (flag off) this is a no-op
// preview so the UI behaves exactly as before; in real mode it POSTs to the
// backend with the session token. The caller refreshes the thread on success.
export async function sendConversationMessage(
  conversationId: string,
  body: string,
): Promise<SendMessageResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, mode: useRealPortalAuth ? "real" : "mock", error: "empty" };
  }

  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const result = await portalApiPost(
    `/me/conversations/${encodeURIComponent(conversationId)}/messages`,
    { body: trimmed },
  );

  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : "send_failed",
  };
}
