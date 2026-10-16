import type { Payment } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole, requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { requireCapability } from "../lib/capabilities";
import { resolveParent } from "../lib/current-parent";
import { isAllowedUploadMimeType } from "../lib/file-validation";
import {
  invoiceStatus,
  newReference,
  notifyPaymentParent,
  notifyPendingPaymentVerifiers,
  verifyPaymentRecord,
} from "../lib/payments";
import { getObjectBytes, uploadObject } from "../lib/storage";
import { prisma } from "../db";

const cashSchema = z.object({
  studentId: z.string().min(1),
  invoiceId: z.string().min(1).optional(),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  reference: z.string().min(1).optional(),
  note: z.string().optional(),
});

const momoSchema = z.object({
  studentId: z.string().min(1),
  invoiceId: z.string().min(1).optional(),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  reference: z.string().min(1),
  note: z.string().optional(),
});

const bankSchema = z.object({
  studentId: z.string().min(1),
  invoiceId: z.string().min(1).optional(),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  reference: z.string().min(1).optional(),
  bankName: z.string().min(1),
  depositorName: z.string().min(1),
  depositDate: z.string().min(1),
  note: z.string().optional(),
  file: z
    .object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      dataBase64: z.string().min(1),
    })
    .optional(),
});

const feeItemSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  term: z.string().min(1),
  academicYear: z.string().min(1),
  dueDate: z.string().optional().default(""),
});

const invoiceSchema = z.object({
  studentId: z.string().min(1),
  feeItemIds: z.array(z.string().min(1)).min(1),
  dueDate: z.string().optional().default(""),
});

// Increment 4: finance (fee items, invoices, payments) + cash-desk write.
export async function financeRoutes(app: FastifyInstance): Promise<void> {
  app.get("/fee-items", async (request, reply) => {
    // Fee catalogue (titles/categories/amounts) is not sensitive; any signed-in
    // user may read it (parents need it to label invoices and category totals).
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const feeItems = await prisma.feeItem.findMany({ orderBy: { title: "asc" } });
    return reply.send({ feeItems });
  });

  // Fee catalogue setup. Capability-gated so the school can hand fee setup to
  // the registry or keep it with accounts.
  app.post("/fee-items", async (request, reply) => {
    const actor = await requireCapability(request, reply, "finance.manage");
    if (!actor) return;

    const parsed = feeItemSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const feeItem = await prisma.feeItem.create({
      data: {
        title: parsed.data.title.trim(),
        category: parsed.data.category,
        amount: parsed.data.amount,
        term: parsed.data.term,
        academicYear: parsed.data.academicYear,
        dueDate: parsed.data.dueDate || null,
      },
    });

    await recordAudit(request, {
      actor,
      action: "finance.fee_item_created",
      targetType: "fee_item",
      targetId: feeItem.id,
      summary: `title=${feeItem.title} category=${feeItem.category} amount=${feeItem.amount} term=${feeItem.term}`,
    });

    return reply.code(201).send({ feeItem });
  });

  app.get("/invoices", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin", "accounts"]);
    if (!actor) return;
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ invoices });
  });

  // Assign fee items to a learner. The total is computed from the catalogue,
  // never taken from the request — a client-supplied total would let the
  // browser decide what a family owes.
  app.post("/invoices", async (request, reply) => {
    const actor = await requireCapability(request, reply, "finance.manage");
    if (!actor) return;

    const parsed = invoiceSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });
    if (!student) return reply.code(404).send({ error: "student_not_found" });

    const feeItems = await prisma.feeItem.findMany({
      where: { id: { in: parsed.data.feeItemIds } },
    });
    if (feeItems.length !== parsed.data.feeItemIds.length) {
      return reply.code(400).send({ error: "unknown_fee_item" });
    }

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);
    const dueDate =
      parsed.data.dueDate ||
      feeItems.map((item) => item.dueDate).filter(Boolean).sort()[0] ||
      null;

    const invoice = await prisma.invoice.create({
      data: {
        studentId: student.id,
        feeItemIds: feeItems.map((item) => item.id),
        totalAmount,
        amountPaid: 0,
        balance: totalAmount,
        status: invoiceStatus(totalAmount, 0),
        dueDate,
      },
    });

    await recordAudit(request, {
      actor,
      action: "finance.invoice_created",
      targetType: "invoice",
      targetId: invoice.id,
      summary: `student=${student.id} items=${feeItems.length} total=${totalAmount}`,
    });

    return reply.code(201).send({ invoice });
  });

  app.get("/payments", async (request, reply) => {
    const actor = await requireRole(request, reply, ["admin", "accounts"]);
    if (!actor) return;
    const payments = await prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      include: { attachment: { select: { id: true } } },
    });
    return reply.send({
      payments: payments.map(({ attachment, ...payment }) => ({
        ...payment,
        hasAttachment: Boolean(attachment),
      })),
    });
  });

  // Parent: their children's invoices / payments.
  app.get("/me/invoices", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);
    if (!parent) return reply.send({ invoices: [] });
    const invoices = await prisma.invoice.findMany({
      where: { studentId: { in: parent.childIds } },
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ invoices });
  });

  app.get("/me/payments", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);
    if (!parent) return reply.send({ payments: [] });
    const payments = await prisma.payment.findMany({
      where: {
        OR: [{ parentId: parent.id }, { studentId: { in: parent.childIds } }],
      },
      orderBy: { paidAt: "desc" },
    });
    return reply.send({ payments });
  });

  // Parent: submit a Mobile Money payment (paid externally at the school's
  // merchant number). Creates a PENDING payment for accounts to verify.
  app.post("/me/payments/momo", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);
    if (!parent) return reply.code(403).send({ error: "forbidden" });

    const parsed = momoSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    if (!parent.childIds.includes(parsed.data.studentId)) {
      return reply.code(403).send({ error: "forbidden" });
    }
    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });
    if (!student) return reply.code(404).send({ error: "student_not_found" });

    let payment: Payment;
    try {
      payment = await prisma.payment.create({
        data: {
          parentId: parent.id,
          studentId: parsed.data.studentId,
          invoiceId: parsed.data.invoiceId ?? null,
          category: parsed.data.category,
          amount: parsed.data.amount,
          method: "momo",
          status: "pending",
          reference: parsed.data.reference,
          note: parsed.data.note ?? null,
        },
      });
    } catch {
      return reply.code(409).send({ error: "duplicate_reference" });
    }

    await notifyPendingPaymentVerifiers(
      "MoMo payment to verify",
      `${student.fullName}: GHS ${payment.amount} (${payment.category}), ref ${payment.reference}.`,
    );
    await recordAudit(request, {
      actor,
      action: "finance.payment_submitted",
      targetType: "payment",
      targetId: payment.id,
      summary: `method=momo amount=${payment.amount} category=${payment.category} student=${student.id} reference=${payment.reference}`,
    });
    return reply.code(201).send({ payment });
  });

  // Parent: submit a bank deposit with structured fields + an optional receipt
  // image (stored as bytes for now). Creates a PENDING payment.
  app.post("/me/payments/bank", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;
    const parent = await resolveParent(actor.id);
    if (!parent) return reply.code(403).send({ error: "forbidden" });

    const parsed = bankSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }
    if (!parent.childIds.includes(parsed.data.studentId)) {
      return reply.code(403).send({ error: "forbidden" });
    }
    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });
    if (!student) return reply.code(404).send({ error: "student_not_found" });

    if (
      parsed.data.file &&
      !isAllowedUploadMimeType(parsed.data.file.mimeType)
    ) {
      return reply.code(400).send({ error: "unsupported_file_type" });
    }

    const reference = parsed.data.reference ?? newReference("BANK");
    let payment: Payment;
    try {
      payment = await prisma.payment.create({
        data: {
          parentId: parent.id,
          studentId: parsed.data.studentId,
          invoiceId: parsed.data.invoiceId ?? null,
          category: parsed.data.category,
          amount: parsed.data.amount,
          method: "bank",
          status: "pending",
          reference,
          bankName: parsed.data.bankName,
          depositorName: parsed.data.depositorName,
          depositDate: parsed.data.depositDate,
          note: parsed.data.note ?? null,
        },
      });
    } catch {
      return reply.code(409).send({ error: "duplicate_reference" });
    }

    if (parsed.data.file) {
      const objectKey = `payment-attachments/${payment.id}`;
      await uploadObject(
        objectKey,
        Buffer.from(parsed.data.file.dataBase64, "base64"),
        parsed.data.file.mimeType,
      );
      await prisma.paymentAttachment.create({
        data: {
          paymentId: payment.id,
          fileName: parsed.data.file.fileName,
          mimeType: parsed.data.file.mimeType,
          objectKey,
        },
      });
    }

    await notifyPendingPaymentVerifiers(
      "Bank deposit to verify",
      `${student.fullName}: GHS ${payment.amount} (${payment.category}) deposited at ${payment.bankName}, ref ${payment.reference}.`,
    );
    await recordAudit(request, {
      actor,
      action: "finance.payment_submitted",
      targetType: "payment",
      targetId: payment.id,
      summary: `method=bank amount=${payment.amount} category=${payment.category} student=${student.id} reference=${payment.reference} attachment=${Boolean(parsed.data.file)}`,
    });
    return reply.code(201).send({ payment });
  });

  // Accounts: record a cash payment at the office desk. Cash is verified
  // immediately — recompute the invoice, create a receipt, and notify the parent.
  app.post("/payments/cash", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const parsed = cashSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });
    if (!student) {
      return reply.code(404).send({ error: "student_not_found" });
    }

    const reference = parsed.data.reference ?? newReference("CASH");
    const parent = await prisma.parent.findFirst({
      where: { childIds: { has: student.id } },
    });

    const created = await prisma.payment.create({
      data: {
        parentId: parent?.id ?? null,
        studentId: parsed.data.studentId,
        invoiceId: parsed.data.invoiceId ?? null,
        category: parsed.data.category,
        amount: parsed.data.amount,
        method: "cash",
        status: "pending",
        reference,
        note: parsed.data.note ?? null,
      },
    });

    // Cash is verified the moment it is handed over, but it still goes through
    // the one shared verification helper rather than applying its own invoice/
    // receipt/notification logic. Duplicating those effects here is how the
    // cash desk silently stopped crediting feeding and transport wallets.
    const verified = await verifyPaymentRecord(created.id, actor.id);
    if (!verified.ok) {
      return reply.code(400).send({ error: verified.error });
    }

    await recordAudit(request, {
      actor,
      action: "finance.payment_recorded",
      targetType: "payment",
      targetId: verified.payment.id,
      summary: `method=cash amount=${verified.payment.amount} category=${verified.payment.category} student=${student.id} reference=${verified.payment.reference}`,
    });

    return reply.code(201).send({ payment: verified.payment });
  });

  // Accounts/admin: verify a pending payment (idempotent).
  app.post("/payments/:id/verify", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const result = await verifyPaymentRecord(id, actor.id);
    if (!result.ok) {
      return reply.code(404).send({ error: result.error });
    }
    await recordAudit(request, {
      actor,
      action: "finance.payment_verified",
      targetType: "payment",
      targetId: id,
    });
    return reply.send({ payment: result.payment });
  });

  // Accounts/admin: reject a pending payment with a reason.
  app.post("/payments/:id/reject", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const reason =
      (request.body as { reason?: string } | undefined)?.reason?.trim() ||
      "Not verified.";
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return reply.code(404).send({ error: "not_found" });

    const student = await prisma.student.findUnique({
      where: { id: payment.studentId },
    });
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: "rejected",
        verifiedById: actor.id,
        verifiedAt: new Date(),
        rejectionReason: reason,
      },
    });
    await notifyPaymentParent(
      updated,
      "Payment could not be verified",
      `Your ${updated.method.toUpperCase()} payment of GHS ${updated.amount}${student ? ` for ${student.fullName}` : ""} was not verified: ${reason}`,
      "important",
    );
    await recordAudit(request, {
      actor,
      action: "finance.payment_rejected",
      targetType: "payment",
      targetId: id,
      summary: `reason=${reason}`,
    });

    return reply.send({ payment: updated });
  });

  // Accounts/admin: stream a bank-deposit receipt attachment.
  app.get("/payments/:id/attachment", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const attachment = await prisma.paymentAttachment.findUnique({
      where: { paymentId: id },
    });
    if (!attachment) return reply.code(404).send({ error: "not_found" });

    const bytes = await getObjectBytes(attachment.objectKey);
    if (!bytes) return reply.code(404).send({ error: "not_found" });

    await recordAudit(request, {
      actor,
      action: "finance.payment_attachment_viewed",
      targetType: "payment",
      targetId: id,
    });

    return reply
      .header("content-type", attachment.mimeType)
      .header(
        "content-disposition",
        `inline; filename="${attachment.fileName}"`,
      )
      .send(bytes);
  });
}
