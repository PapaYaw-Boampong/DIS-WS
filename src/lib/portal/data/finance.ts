import "server-only";

import { mockFeeItems, mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type { FeeItem, Invoice, Payment } from "@/types/portal";

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
