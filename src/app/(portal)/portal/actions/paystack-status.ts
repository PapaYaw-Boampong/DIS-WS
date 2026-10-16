"use server";

import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";

export type PaystackPaymentState = {
  readonly status:
    | "initiated"
    | "verified"
    | "failed"
    | "abandoned"
    | "rejected"
    | "pending"
    | "unknown";
  readonly amount?: number;
  readonly channel?: string | null;
};

/**
 * Ask OUR backend what happened to a Paystack payment. The confirm page polls
 * this — it must never infer success from the fact that Paystack redirected
 * back, because a parent can reach that URL by hand and abandoning checkout
 * redirects too. The backend re-verifies against Paystack on each call while
 * the payment is still `initiated`.
 */
export async function getPaystackPaymentState(
  reference: string,
): Promise<PaystackPaymentState> {
  if (!useRealPortalAuth) {
    return { status: "unknown" };
  }

  const data = await portalApiGet<{
    status?: PaystackPaymentState["status"];
    amount?: number;
    channel?: string | null;
  }>(`/me/payments/paystack/${encodeURIComponent(reference)}`, {});

  return {
    status: data.status ?? "unknown",
    amount: data.amount,
    channel: data.channel,
  };
}
