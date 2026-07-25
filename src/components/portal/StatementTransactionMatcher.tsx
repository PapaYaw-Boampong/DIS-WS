"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Link2 } from "lucide-react";

import { matchStatementTransaction } from "@/app/(portal)/portal/actions/statements";
import { formatPortalCurrency } from "@/lib/portal/format";

type CandidatePayment = {
  readonly id: string;
  readonly reference: string;
  readonly studentName: string;
  readonly amount: number;
};

type StatementTransactionMatcherProps = {
  readonly transactionId: string;
  readonly candidates: readonly CandidatePayment[];
};

export function StatementTransactionMatcher({
  transactionId,
  candidates,
}: StatementTransactionMatcherProps) {
  const [paymentId, setPaymentId] = useState(candidates[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (candidates.length === 0) {
    return (
      <p className="text-xs text-muted-grey">
        No pending payments of this method are available to match.
      </p>
    );
  }

  function handleMatch() {
    if (!paymentId) return;
    startTransition(async () => {
      const result = await matchStatementTransaction(transactionId, paymentId);
      if (result.ok) {
        router.refresh();
      } else {
        setMessage("Could not link this transaction. It may already be matched.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={paymentId}
        onChange={(event) => setPaymentId(event.target.value)}
        className="min-h-9 rounded-xl border border-border bg-white px-3 text-xs font-normal"
      >
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.studentName} · {candidate.reference} ·{" "}
            {formatPortalCurrency(candidate.amount)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleMatch}
        disabled={pending}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-curry-orange px-3 text-xs font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
      >
        <Link2 aria-hidden="true" className="size-3.5" />
        Match
      </button>
      {message ? (
        <span className="text-xs font-semibold text-red-700">{message}</span>
      ) : null}
    </div>
  );
}
