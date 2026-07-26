"use server";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import type { StatementImport } from "@/types/portal";

export type StatementActionResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly error?: string;
  readonly import?: StatementImport;
};

// Accounts/admin: upload a MoMo or bank statement export (CSV). The backend
// parses each row and auto-matches it against pending payments of the same
// method (exact reference, or amount + date + fuzzy depositor name).
export async function importStatement(
  formData: FormData,
): Promise<StatementActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const method = String(formData.get("method") ?? "");
  const file = formData.get("file");
  if ((method !== "momo" && method !== "bank") || !(file instanceof File)) {
    return { ok: false, mode: "real", error: "invalid_request" };
  }

  const csvContent = await file.text();
  const result = await portalApiPost<{
    import?: StatementImport;
    error?: string;
  }>("/statements/import", { method, fileName: file.name, csvContent });

  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "import_failed"),
    import: result.data?.import,
  };
}

export type MatchTransactionResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly error?: string;
};

// Accounts/admin: manually link an unmatched statement row to a chosen
// pending payment, then verify it exactly as an auto-match would.
export async function matchStatementTransaction(
  transactionId: string,
  paymentId: string,
): Promise<MatchTransactionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost<{ error?: string }>(
    `/statements/transactions/${encodeURIComponent(transactionId)}/match`,
    { paymentId },
  );
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "match_failed"),
  };
}
