import { randomBytes } from "node:crypto";

import type { Payment, Student } from "@prisma/client";

import { prisma } from "../db";

// Shared payment helpers used by both the direct verify/reject routes
// (finance.ts) and the statement-reconciliation auto-matcher (statements.ts),
// so both paths apply the exact same invoice/receipt/notification effects.

export function invoiceStatus(total: number, paid: number): string {
  if (paid <= 0) return "unpaid";
  if (paid < total) return "partially_paid";
  if (paid === total) return "paid";
  return "overpaid";
}

export function newReference(prefix: string): string {
  return `${prefix}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

// Add a verified payment's amount onto its invoice and recompute status.
export async function applyPaymentToInvoice(
  invoiceId: string,
  amount: number,
): Promise<void> {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;
  const amountPaid = invoice.amountPaid + amount;
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid,
      balance: invoice.totalAmount - amountPaid,
      status: invoiceStatus(invoice.totalAmount, amountPaid),
    },
  });
}

// Generate a receipt document for a verified payment (parent-visible).
export async function createReceipt(
  payment: Payment,
  student: Student,
): Promise<string> {
  const receipt = await prisma.documentAsset.create({
    data: {
      title: `Payment Receipt — ${payment.reference}`,
      description: `${payment.method.toUpperCase()} payment of GHS ${payment.amount} for ${student.fullName} (${payment.category}).`,
      category: "receipt",
      audience: "parent",
      studentId: student.id,
      downloadable: true,
      publishedAt: new Date().toISOString().slice(0, 10),
    },
  });
  return receipt.id;
}

// Insert a notification (role-broadcast and/or user-targeted).
export async function notify(input: {
  audience?: string;
  userId?: string | null;
  title: string;
  body: string;
  priority?: string;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      audience: input.audience ?? "all",
      userId: input.userId ?? null,
      title: input.title,
      body: input.body,
      priority: input.priority ?? "normal",
    },
  });
}

// Notify the parent linked to a payment's student, if resolvable. Uses the
// "user" audience sentinel (never "all") so `GET /me/notifications`' audience
// OR-clause can't broadcast this to every role — only the exact `userId`
// matches. (Leaving `audience` at its "all" default here previously leaked
// per-parent payment notices to every signed-in user.)
export async function notifyPaymentParent(
  payment: Payment,
  title: string,
  body: string,
  priority = "normal",
): Promise<void> {
  const parent = payment.parentId
    ? await prisma.parent.findUnique({ where: { id: payment.parentId } })
    : await prisma.parent.findFirst({
        where: { childIds: { has: payment.studentId } },
      });
  if (parent?.userId) {
    await notify({ audience: "user", userId: parent.userId, title, body, priority });
  }
}

// Both accounts and admin can verify payments (requireRole(["accounts",
// "admin"]) throughout finance.ts), but `Notification.audience` is a single
// role string, so a "new pending payment" alert needs one broadcast per role
// to reach everyone who is allowed to act on it.
export async function notifyPendingPaymentVerifiers(
  title: string,
  body: string,
): Promise<void> {
  await Promise.all([
    notify({ audience: "admin", title, body, priority: "important" }),
    notify({ audience: "accounts", title, body, priority: "important" }),
  ]);
}

export type VerifyResult =
  | { ok: true; payment: Payment }
  | { ok: false; error: "not_found" | "student_not_found" };

// Verify a payment: recompute its invoice, generate a receipt, and notify the
// parent. Idempotent — verifying an already-verified payment is a no-op success.
// Used by the direct accounts "Verify" action, the statement auto-matcher, and
// the manual statement-transaction match override — every verification path
// funnels through here so the effects are always identical.
export async function verifyPaymentRecord(
  paymentId: string,
  verifiedById: string | null,
): Promise<VerifyResult> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { ok: false, error: "not_found" };
  if (payment.status === "verified") return { ok: true, payment };

  const student = await prisma.student.findUnique({
    where: { id: payment.studentId },
  });
  if (!student) return { ok: false, error: "student_not_found" };

  if (payment.invoiceId) {
    await applyPaymentToInvoice(payment.invoiceId, payment.amount);
  }
  const receiptId = await createReceipt(payment, student);
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "verified",
      verifiedById,
      verifiedAt: new Date(),
      rejectionReason: null,
      receiptDocumentId: receiptId,
    },
  });
  await notifyPaymentParent(
    updated,
    "Payment verified",
    `Your ${updated.method.toUpperCase()} payment of GHS ${updated.amount} for ${student.fullName} has been verified. A receipt is available under Documents.`,
    "important",
  );

  return { ok: true, payment: updated };
}
