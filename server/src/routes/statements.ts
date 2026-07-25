import type { Payment } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import { verifyPaymentRecord } from "../lib/payments";
import { prisma } from "../db";

// Statement-driven reconciliation for MoMo + Bank (per the school's process):
// the school requests a statement from the provider/bank, it arrives by email,
// an admin uploads it here (CSV today), the backend parses each row and tries
// to match it to a PENDING payment of the same method. High-confidence matches
// (exact reference, or amount + date + fuzzy depositor name) are auto-verified
// through the same `verifyPaymentRecord` used by the manual Verify button.
// Unmatched rows stay visible for an admin to match by hand.

// --- CSV parsing (self-contained; no external dependency) -----------------

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const headerLine = lines[0];
  if (!headerLine || lines.length < 2) return [];

  const header = splitCsvLine(headerLine).map((cell) =>
    cell.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((key, index) => {
      row[key] = cells[index] ?? "";
    });
    return row;
  });
}

const AMOUNT_KEYS = ["amount", "credit", "creditamount", "amountghs", "value"];
const DATE_KEYS = ["date", "transactiondate", "valuedate", "txndate"];
const REFERENCE_KEYS = [
  "reference",
  "ref",
  "transactionref",
  "narration",
  "description",
];
const NAME_KEYS = [
  "name",
  "depositorname",
  "payername",
  "sendername",
  "customername",
  "accountname",
];

function pick(
  row: Record<string, string>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    if (row[key]) return row[key];
  }
  return undefined;
}

function parseAmount(value: string | undefined): number | null {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function normalizeDate(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const slash = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (slash) {
    const day = slash[1];
    const month = slash[2];
    const year = slash[3];
    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
  return trimmed;
}

function daysBetween(a: string, b: string): number {
  const timeA = new Date(a).getTime();
  const timeB = new Date(b).getTime();
  if (Number.isNaN(timeA) || Number.isNaN(timeB)) return Number.POSITIVE_INFINITY;
  return Math.abs(timeA - timeB) / 86_400_000;
}

function nameTokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function nameSimilarity(a: string, b: string): number {
  const tokensA = nameTokens(a);
  const tokensB = nameTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setB = new Set(tokensB);
  const overlap = tokensA.filter((token) => setB.has(token)).length;
  return overlap / Math.max(tokensA.length, tokensB.length);
}

type StatementRow = {
  amount: number | null;
  date: string;
  reference: string | null;
  name: string | null;
  raw: Record<string, string>;
};

type MatchResult = {
  payment: Payment;
  matchType: "reference" | "amount_date_name";
  confidence: number;
};

const DATE_TOLERANCE_DAYS = 3;
const AUTO_MATCH_THRESHOLD = 70;

function findMatch(
  row: StatementRow,
  candidates: readonly Payment[],
): MatchResult | null {
  if (row.reference) {
    const exact = candidates.find(
      (payment) =>
        payment.reference.toLowerCase() === row.reference?.toLowerCase(),
    );
    // A reference match alone isn't enough to auto-verify: the reference is
    // supplied by the parent at submission time and isn't validated against
    // anything, so a real (small) transaction's reference could otherwise be
    // paired with a fabricated (large) `amount` and get silently credited to
    // the invoice. Require the statement row's real amount to agree before
    // trusting the reference match; a mismatch falls through to "unmatched"
    // for manual review rather than the fuzzy amount+date+name path (which
    // would also reject it on amount, but falling through here is explicit).
    if (exact && row.amount !== null && exact.amount === row.amount) {
      return { payment: exact, matchType: "reference", confidence: 100 };
    }
  }

  if (row.amount === null) return null;

  let best: MatchResult | null = null;
  for (const payment of candidates) {
    if (payment.amount !== row.amount) continue;
    const paymentDate =
      payment.depositDate ?? payment.paidAt.toISOString().slice(0, 10);
    const dayDiff = daysBetween(paymentDate, row.date);
    if (dayDiff > DATE_TOLERANCE_DAYS) continue;

    const candidateName = payment.depositorName ?? "";
    const similarity = row.name
      ? nameSimilarity(row.name, candidateName || payment.reference)
      : 0.5;
    const confidence = Math.min(
      99,
      Math.round(
        60 + Math.max(0, DATE_TOLERANCE_DAYS - dayDiff) * 5 + similarity * 25,
      ),
    );
    if (!best || confidence > best.confidence) {
      best = { payment, matchType: "amount_date_name", confidence };
    }
  }

  return best && best.confidence >= AUTO_MATCH_THRESHOLD ? best : null;
}

const importSchema = z.object({
  method: z.enum(["momo", "bank"]),
  fileName: z.string().min(1),
  csvContent: z.string().min(1),
});

export async function statementRoutes(app: FastifyInstance): Promise<void> {
  // Accounts/admin: upload a MoMo or bank statement export; parse + auto-match.
  app.post("/statements/import", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const parsed = importSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const rawRows = parseCsv(parsed.data.csvContent);
    if (rawRows.length === 0) {
      return reply.code(400).send({ error: "empty_or_unparseable_file" });
    }

    const pendingPayments = await prisma.payment.findMany({
      where: { method: parsed.data.method, status: "pending" },
    });
    const consumed = new Set<string>();

    const transactionsToCreate: Array<{
      amount: number;
      date: string;
      reference: string | null;
      counterpartyName: string | null;
      raw: Record<string, string>;
      matchedPaymentId: string | null;
      matchType: string | null;
      matchConfidence: number | null;
    }> = [];

    for (const raw of rawRows) {
      const row: StatementRow = {
        amount: parseAmount(pick(raw, AMOUNT_KEYS)),
        date: normalizeDate(pick(raw, DATE_KEYS)),
        reference: pick(raw, REFERENCE_KEYS) ?? null,
        name: pick(raw, NAME_KEYS) ?? null,
        raw,
      };

      let match =
        row.amount === null
          ? null
          : findMatch(
              row,
              pendingPayments.filter((payment) => !consumed.has(payment.id)),
            );

      if (match) {
        const result = await verifyPaymentRecord(match.payment.id, actor.id);
        if (result.ok) {
          consumed.add(match.payment.id);
        } else {
          match = null;
        }
      }

      transactionsToCreate.push({
        amount: row.amount ?? 0,
        date: row.date,
        reference: row.reference,
        counterpartyName: row.name,
        raw: row.raw,
        matchedPaymentId: match?.payment.id ?? null,
        matchType: match?.matchType ?? null,
        matchConfidence: match?.confidence ?? null,
      });
    }

    const statementImport = await prisma.statementImport.create({
      data: {
        method: parsed.data.method,
        fileName: parsed.data.fileName,
        importedById: actor.id,
        rowCount: rawRows.length,
        matchedCount: consumed.size,
        transactions: { create: transactionsToCreate },
      },
      include: { transactions: { orderBy: { createdAt: "asc" } } },
    });

    await recordAudit(request, {
      actor,
      action: "finance.statement_imported",
      targetType: "statement_import",
      targetId: statementImport.id,
      summary: `method=${parsed.data.method} rows=${rawRows.length} matched=${consumed.size}`,
    });

    return reply.code(201).send({ import: statementImport });
  });

  app.get("/statements", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;
    const imports = await prisma.statementImport.findMany({
      orderBy: { importedAt: "desc" },
    });
    return reply.send({ imports });
  });

  app.get("/statements/:id", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;
    const { id } = request.params as { id: string };
    const statementImport = await prisma.statementImport.findUnique({
      where: { id },
      include: { transactions: { orderBy: { createdAt: "asc" } } },
    });
    if (!statementImport) return reply.code(404).send({ error: "not_found" });
    return reply.send({ import: statementImport });
  });

  // Accounts/admin: manually link an unmatched statement row to a specific
  // pending payment (override), then verify it the same way an auto-match would.
  app.post("/statements/transactions/:id/match", async (request, reply) => {
    const actor = await requireRole(request, reply, ["accounts", "admin"]);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const paymentId = (request.body as { paymentId?: string } | undefined)
      ?.paymentId;
    if (!paymentId) return reply.code(400).send({ error: "invalid_request" });

    const transaction = await prisma.statementTransaction.findUnique({
      where: { id },
    });
    if (!transaction) return reply.code(404).send({ error: "not_found" });
    if (transaction.matchedPaymentId) {
      return reply.code(409).send({ error: "already_matched" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) return reply.code(404).send({ error: "payment_not_found" });
    if (payment.status !== "pending") {
      return reply.code(409).send({ error: "payment_not_pending" });
    }

    const result = await verifyPaymentRecord(paymentId, actor.id);
    if (!result.ok) {
      return reply.code(409).send({ error: result.error });
    }

    const updatedTransaction = await prisma.statementTransaction.update({
      where: { id },
      data: {
        matchedPaymentId: paymentId,
        matchType: "manual",
        matchConfidence: 100,
      },
    });
    await prisma.statementImport.update({
      where: { id: transaction.importId },
      data: { matchedCount: { increment: 1 } },
    });

    await recordAudit(request, {
      actor,
      action: "finance.statement_transaction_matched",
      targetType: "statement_transaction",
      targetId: id,
      summary: `paymentId=${paymentId}`,
    });

    return reply.send({
      transaction: updatedTransaction,
      payment: result.payment,
    });
  });
}
