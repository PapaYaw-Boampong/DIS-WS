import { createHmac, timingSafeEqual } from "node:crypto";

import { env, paystackEnabled } from "../env";

// Paystack provider boundary. Everything provider-shaped — HTTP calls, the
// pesewa/cedi unit conversion, and webhook signature checking — lives here so
// the finance routes stay in the portal's own units and vocabulary.

const PAYSTACK_API = "https://api.paystack.co";

// Payment.amount, Invoice.totalAmount and FeeItem.amount are whole Ghana cedis
// throughout this codebase. Paystack takes and returns PESEWAS. Converting
// anywhere other than here is how a 100x credit happens.
export const toPesewas = (cedis: number): number => Math.round(cedis * 100);
export const toCedis = (pesewas: number): number => pesewas / 100;

export type PaystackInitializeResult =
  | { ok: true; authorizationUrl: string; accessCode: string }
  | { ok: false; error: string };

export type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  fees?: number;
  paid_at?: string;
  gateway_response?: string;
};

export type PaystackVerifyResult =
  | { ok: true; transaction: PaystackTransaction }
  | { ok: false; error: string };

async function paystackFetch(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const response = await fetch(`${PAYSTACK_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.PAYSTACK_SECRET_KEY ?? ""}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  return { ok: response.ok, status: response.status, body };
}

export async function initializeTransaction(input: {
  email: string;
  amountCedis: number;
  reference: string;
  callbackUrl?: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackInitializeResult> {
  if (!paystackEnabled) {
    return { ok: false, error: "paystack_disabled" };
  }

  try {
    const { ok, body } = await paystackFetch("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: toPesewas(input.amountCedis),
        currency: "GHS",
        reference: input.reference,
        callback_url: input.callbackUrl ?? env.PAYSTACK_CALLBACK_URL,
        metadata: input.metadata,
      }),
    });

    const data = (body as { status?: boolean; data?: Record<string, string> })
      ?.data;

    if (!ok || !data?.authorization_url) {
      return { ok: false, error: "initialize_failed" };
    }

    return {
      ok: true,
      authorizationUrl: data.authorization_url,
      accessCode: data.access_code ?? "",
    };
  } catch {
    return { ok: false, error: "provider_unreachable" };
  }
}

export async function verifyTransaction(
  reference: string,
): Promise<PaystackVerifyResult> {
  if (!paystackEnabled) {
    return { ok: false, error: "paystack_disabled" };
  }

  try {
    const { ok, body } = await paystackFetch(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    const data = (body as { data?: PaystackTransaction })?.data;

    if (!ok || !data) {
      return { ok: false, error: "verify_failed" };
    }

    return { ok: true, transaction: data };
  } catch {
    return { ok: false, error: "provider_unreachable" };
  }
}

/**
 * Paystack signs the exact bytes it sent with HMAC-SHA512 keyed on the secret
 * key. The raw buffer must be the one received off the wire — verifying a
 * re-serialised body fails intermittently (key order, whitespace) and looks
 * like a provider bug.
 */
export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string | undefined,
): boolean {
  if (!signature || !env.PAYSTACK_SECRET_KEY) return false;

  const expected = createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  // timingSafeEqual throws on a length mismatch, which is itself a leak-free
  // rejection — but check first so a malformed header is a clean `false`.
  if (expectedBuffer.length !== providedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
