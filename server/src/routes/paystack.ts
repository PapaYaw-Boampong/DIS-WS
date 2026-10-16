import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { resolveParent } from "../lib/current-parent";
import { paystackEnabled, paystackKeyMode, env } from "../env";
import {
  initializeTransaction,
  toCedis,
  verifyTransaction,
  verifyWebhookSignature,
} from "../lib/paystack";
import {
  newReference,
  notifyPaymentParent,
  verifyPaymentRecord,
} from "../lib/payments";
import { prisma } from "../db";

const initializeSchema = z.object({
  studentId: z.string().min(1),
  invoiceId: z.string().min(1).optional(),
  category: z.string().min(1),
  amount: z.number().int().positive(),
  note: z.string().optional(),
});

export type ConfirmResult =
  | { ok: true; status: "verified"; paymentId: string }
  | { ok: false; reason: string };

/**
 * The single credit path for a Paystack payment, called by both the webhook
 * and the parent's return-from-checkout poll.
 *
 * Never credits from a webhook payload — the payload only says "go look". The
 * verify call is what is trusted, and amount/currency are re-checked against
 * our own record before a cedi moves.
 */
export async function confirmPaystackPayment(
  reference: string,
): Promise<ConfirmResult> {
  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment) return { ok: false, reason: "not_found" };
  if (payment.status === "verified") {
    return { ok: true, status: "verified", paymentId: payment.id };
  }

  const result = await verifyTransaction(reference);
  if (!result.ok) return { ok: false, reason: result.error };

  const transaction = result.transaction;

  if (transaction.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: transaction.status === "abandoned" ? "abandoned" : "failed",
        providerMessage: transaction.gateway_response ?? transaction.status,
      },
    });
    return { ok: false, reason: `provider_status_${transaction.status}` };
  }

  if (transaction.currency !== "GHS") {
    return { ok: false, reason: "currency_mismatch" };
  }

  // The amount guard. A mismatch here is either a tampered checkout or a unit
  // bug; either way the ledger must not move.
  if (toCedis(transaction.amount) !== payment.amount) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "failed",
        providerMessage: `amount mismatch: provider ${toCedis(transaction.amount)} vs record ${payment.amount}`,
      },
    });
    return { ok: false, reason: "amount_mismatch" };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerChannel: transaction.channel ?? null,
      providerFee: transaction.fees ?? null,
      providerPaidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
      providerMessage: transaction.gateway_response ?? null,
    },
  });

  // verifiedById stays null: nobody at the school verified this, the provider
  // did. `provider = "paystack"` is what marks it machine-verified.
  const verified = await verifyPaymentRecord(payment.id, null);
  if (!verified.ok) return { ok: false, reason: verified.error };

  return { ok: true, status: "verified", paymentId: payment.id };
}

export async function paystackRoutes(app: FastifyInstance): Promise<void> {
  // Which payment lanes are open. The frontend asks rather than reading a
  // public flag of its own, so it can never offer a lane the server can't serve.
  app.get("/finance/payment-methods", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    return reply.send({
      momo: true,
      bank: true,
      paystack: paystackEnabled,
    });
  });

  // Readiness detail for the payment-readiness screen. Never returns the key.
  app.get("/finance/paystack/status", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [stuck, lastConfirmed] = await Promise.all([
      prisma.payment.count({
        where: {
          provider: "paystack",
          status: "initiated",
          paidAt: { lt: hourAgo },
        },
      }),
      prisma.payment.findFirst({
        where: { provider: "paystack", providerPaidAt: { not: null } },
        orderBy: { providerPaidAt: "desc" },
        select: { providerPaidAt: true },
      }),
    ]);

    return reply.send({
      enabled: paystackEnabled,
      keyMode: paystackKeyMode,
      callbackUrl: env.PAYSTACK_CALLBACK_URL ?? null,
      stuckInitiated: stuck,
      lastConfirmedAt: lastConfirmed?.providerPaidAt ?? null,
    });
  });

  // Parent: open a Paystack checkout for one of their own children.
  app.post("/me/payments/paystack/initialize", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    if (!paystackEnabled) {
      return reply.code(503).send({ error: "paystack_disabled" });
    }

    const parent = await resolveParent(actor.id);
    if (!parent) return reply.code(403).send({ error: "forbidden" });

    const parsed = initializeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    // Same ownership check as the MoMo lane. This must not be the one place
    // it is skipped.
    if (!parent.childIds.includes(parsed.data.studentId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const student = await prisma.student.findUnique({
      where: { id: parsed.data.studentId },
    });
    if (!student) return reply.code(404).send({ error: "student_not_found" });

    // Overpayment goes through the office, not self-service checkout.
    if (parsed.data.invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: parsed.data.invoiceId },
      });
      if (!invoice) return reply.code(404).send({ error: "invoice_not_found" });
      if (parsed.data.amount > invoice.balance) {
        return reply.code(400).send({ error: "amount_exceeds_balance" });
      }
    }

    const email = parent.email?.trim();
    if (!email || !email.includes("@")) {
      return reply.code(400).send({ error: "parent_email_required" });
    }

    // Our reference is Paystack's reference, so the webhook, the verify call
    // and our ledger all key on one string.
    const reference = newReference("PSK");
    const payment = await prisma.payment.create({
      data: {
        parentId: parent.id,
        studentId: parsed.data.studentId,
        invoiceId: parsed.data.invoiceId ?? null,
        category: parsed.data.category,
        amount: parsed.data.amount,
        method: "paystack",
        status: "initiated",
        reference,
        providerReference: reference,
        provider: "paystack",
        note: parsed.data.note ?? null,
      },
    });

    const initialized = await initializeTransaction({
      email,
      amountCedis: payment.amount,
      reference,
      metadata: {
        paymentId: payment.id,
        studentId: student.id,
        invoiceId: payment.invoiceId,
        category: payment.category,
      },
    });

    if (!initialized.ok) {
      // Nothing was attempted at the provider — drop the intent rather than
      // leaving a permanent `initiated` row that the readiness screen would
      // report as a stuck payment.
      await prisma.payment.delete({ where: { id: payment.id } });
      request.log.error(
        { reference, error: initialized.error },
        "paystack initialize failed",
      );
      return reply.code(502).send({ error: "provider_unavailable" });
    }

    await recordAudit(request, {
      actor,
      action: "finance.paystack_initialized",
      targetType: "payment",
      targetId: payment.id,
      summary: `amount=${payment.amount} category=${payment.category} student=${student.id} reference=${reference}`,
    });

    return reply.code(201).send({
      authorizationUrl: initialized.authorizationUrl,
      reference,
    });
  });

  // The confirm page polls this after Paystack redirects back. It re-verifies
  // against Paystack rather than trusting the redirect — a parent can reach
  // the return URL by hand, and abandoning checkout still redirects.
  app.get<{ Params: { reference: string } }>(
    "/me/payments/paystack/:reference",
    async (request, reply) => {
      const actor = await requireUser(request, reply);
      if (!actor) return;

      const parent = await resolveParent(actor.id);
      if (!parent) return reply.code(403).send({ error: "forbidden" });

      const payment = await prisma.payment.findUnique({
        where: { reference: request.params.reference },
      });
      if (!payment) return reply.code(404).send({ error: "not_found" });
      if (
        payment.parentId !== parent.id &&
        !parent.childIds.includes(payment.studentId)
      ) {
        return reply.code(403).send({ error: "forbidden" });
      }

      if (payment.status === "initiated") {
        await confirmPaystackPayment(payment.reference);
      }

      const latest = await prisma.payment.findUnique({
        where: { id: payment.id },
      });

      return reply.send({
        reference: latest?.reference,
        status: latest?.status,
        amount: latest?.amount,
        channel: latest?.providerChannel,
        message: latest?.providerMessage,
      });
    },
  );
}

/**
 * The Paystack webhook. Public — no session — so its verification has to be
 * airtight: the HMAC is computed over the exact request text (stashed as
 * `request.rawBody` by the JSON parser in index.ts), never over a
 * re-serialised object.
 */
export async function paystackWebhookRoutes(app: FastifyInstance): Promise<void> {
  app.post("/finance/payments/paystack/webhook", async (request, reply) => {
    if (!request.rawBody) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    const raw = Buffer.from(request.rawBody, "utf8");

    if (
      !verifyWebhookSignature(
        raw,
        request.headers["x-paystack-signature"] as string | undefined,
      )
    ) {
      return reply.code(401).send({ error: "invalid_signature" });
    }

    const event = request.body as {
      event?: string;
      data?: { reference?: string };
    };

    const reference = event?.data?.reference;

    // Any well-formed signed event gets a 200, including ones we ignore —
    // Paystack retries non-2xx, and retrying a deliberately dropped event is
    // just noise.
    if (!reference) {
      return reply.send({ received: true });
    }

    if (event.event === "charge.success") {
      const result = await confirmPaystackPayment(reference);
      if (!result.ok) {
        request.log.warn(
          { reference, reason: result.reason },
          "paystack charge.success did not credit",
        );
      }
    } else if (event.event === "charge.failed") {
      const payment = await prisma.payment.findUnique({ where: { reference } });
      if (payment && payment.status !== "verified") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "failed" },
        });
        await notifyPaymentParent(
          payment,
          "Payment did not go through",
          `Your online payment of GHS ${payment.amount} was not completed. No money has left your account for this attempt — you can try again from Pay Now.`,
        );
      }
    }

    return reply.send({ received: true });
  });
}
