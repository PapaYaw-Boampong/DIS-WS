import "server-only";

import { mockFeeItems, mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type { FeeItem, Invoice, Payment } from "@/types/portal";

export type PaymentMethodAvailability = {
  readonly momo: boolean;
  readonly bank: boolean;
  readonly paystack: boolean;
};

// Which payment lanes the backend can actually serve. Asked rather than read
// from a public env flag, so the portal can never offer a checkout the server
// is not configured for. With no backend, only the manual lanes are open.
export async function getPaymentMethods(): Promise<PaymentMethodAvailability> {
  const closed = { momo: true, bank: true, paystack: false };
  if (!useRealPortalAuth) return closed;
  return portalApiGet<PaymentMethodAvailability>(
    "/finance/payment-methods",
    closed,
  );
}

export type PaystackStatus = {
  readonly enabled: boolean;
  readonly keyMode: "test" | "live" | "none";
  readonly callbackUrl: string | null;
  readonly stuckInitiated: number;
  readonly lastConfirmedAt: string | null;
};

// Provider health for the payment-readiness screen. `stuckInitiated` is the
// early warning that webhooks have stopped arriving.
export async function getPaystackStatus(): Promise<PaystackStatus> {
  const offline: PaystackStatus = {
    enabled: false,
    keyMode: "none",
    callbackUrl: null,
    stuckInitiated: 0,
    lastConfirmedAt: null,
  };
  if (!useRealPortalAuth) return offline;
  return portalApiGet<PaystackStatus>("/finance/paystack/status", offline);
}

// Admin / accounts scoped finance reads.
export async function listFeeItems(): Promise<readonly FeeItem[]> {
  if (!useRealPortalAuth) return mockFeeItems;
  const data = await portalApiGet<{ feeItems?: FeeItem[] }>("/fee-items", {});
  return data.feeItems ?? [];
}

export async function listInvoices(): Promise<readonly Invoice[]> {
  if (!useRealPortalAuth) return mockInvoices;
  const data = await portalApiGet<{ invoices?: Invoice[] }>("/invoices", {});
  return data.invoices ?? [];
}

export async function listPayments(): Promise<readonly Payment[]> {
  if (!useRealPortalAuth) return mockPayments;
  const data = await portalApiGet<{ payments?: Payment[] }>("/payments", {});
  return data.payments ?? [];
}
