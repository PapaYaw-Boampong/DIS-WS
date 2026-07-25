"use server";

import { portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";
import type { Payment } from "@/types/portal";

export type PaymentActionResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly error?: string;
  readonly payment?: Payment;
};

export type MomoPaymentInput = {
  readonly studentId: string;
  readonly invoiceId?: string;
  readonly category: string;
  readonly amount: number;
  readonly reference: string;
  readonly note?: string;
};

// Parent: submit a MoMo payment made externally at the school's merchant
// number. Creates a PENDING payment; the school verifies it against the MoMo
// statement (see the statement-reconciliation actions/pages).
export async function submitMomoPayment(
  input: MomoPaymentInput,
): Promise<PaymentActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost<{ payment?: Payment; error?: string }>(
    "/me/payments/momo",
    input,
  );
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "submit_failed"),
    payment: result.data?.payment,
  };
}

// Parent: submit a bank deposit — structured fields plus an optional receipt
// photo. FormData is used because the receipt is a File; the action converts
// it to base64 for the JSON backend request.
export async function submitBankPayment(
  formData: FormData,
): Promise<PaymentActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }

  const studentId = String(formData.get("studentId") ?? "");
  const category = String(formData.get("category") ?? "");
  const amount = Number(formData.get("amount"));
  const bankName = String(formData.get("bankName") ?? "");
  const depositorName = String(formData.get("depositorName") ?? "");
  const depositDate = String(formData.get("depositDate") ?? "");
  const invoiceId = formData.get("invoiceId");
  const note = formData.get("note");
  const file = formData.get("file");

  if (
    !studentId ||
    !category ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !bankName ||
    !depositorName ||
    !depositDate
  ) {
    return { ok: false, mode: "real", error: "invalid_request" };
  }

  let fileInput:
    | { fileName: string; mimeType: string; dataBase64: string }
    | undefined;
  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    fileInput = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataBase64: bytes.toString("base64"),
    };
  }

  const result = await portalApiPost<{ payment?: Payment; error?: string }>(
    "/me/payments/bank",
    {
      studentId,
      category,
      amount,
      bankName,
      depositorName,
      depositDate,
      invoiceId: invoiceId ? String(invoiceId) : undefined,
      note: note ? String(note) : undefined,
      file: fileInput,
    },
  );
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "submit_failed"),
    payment: result.data?.payment,
  };
}

export type CashPaymentInput = {
  readonly studentId: string;
  readonly invoiceId?: string;
  readonly category: string;
  readonly amount: number;
  readonly note?: string;
};

// Accounts: record a cash payment at the office desk — verified immediately.
export async function recordCashPayment(
  input: CashPaymentInput,
): Promise<PaymentActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost<{ payment?: Payment; error?: string }>(
    "/payments/cash",
    input,
  );
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "submit_failed"),
    payment: result.data?.payment,
  };
}

// Accounts/admin: verify a pending payment.
export async function verifyPayment(
  paymentId: string,
): Promise<PaymentActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost<{ payment?: Payment; error?: string }>(
    `/payments/${encodeURIComponent(paymentId)}/verify`,
  );
  return { ok: result.ok, mode: "real", payment: result.data?.payment };
}

// Accounts/admin: reject a pending payment with a reason.
export async function rejectPayment(
  paymentId: string,
  reason: string,
): Promise<PaymentActionResult> {
  if (!useRealPortalAuth) {
    return { ok: true, mode: "mock" };
  }
  const result = await portalApiPost<{ payment?: Payment; error?: string }>(
    `/payments/${encodeURIComponent(paymentId)}/reject`,
    { reason },
  );
  return { ok: result.ok, mode: "real", payment: result.data?.payment };
}
