"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import {
  rejectPayment,
  verifyPayment,
} from "@/app/(portal)/portal/actions/payments";

type PaymentRowActionsProps = {
  readonly paymentId: string;
};

export function PaymentRowActions({ paymentId }: PaymentRowActionsProps) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleVerify() {
    setError(null);
    startTransition(async () => {
      const result = await verifyPayment(paymentId);
      if (result.ok) {
        router.refresh();
      } else {
        setError("Could not verify this payment.");
      }
    });
  }

  function handleReject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectPayment(
        paymentId,
        reason.trim() || "Not verified.",
      );
      if (result.ok) {
        setRejecting(false);
        router.refresh();
      } else {
        setError("Could not reject this payment.");
      }
    });
  }

  return (
    <div className="min-w-40">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={pending}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          <Check aria-hidden="true" className="size-3.5" />
          Verify
        </button>
        <button
          type="button"
          onClick={() => setRejecting((value) => !value)}
          disabled={pending}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-300 px-3 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          <X aria-hidden="true" className="size-3.5" />
          Reject
        </button>
      </div>
      {rejecting ? (
        <div className="mt-2 flex flex-col gap-2">
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for rejection"
            className="min-h-9 rounded-xl border border-border bg-white px-3 text-xs font-normal"
          />
          <button
            type="button"
            onClick={handleReject}
            disabled={pending}
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-red-600 px-3 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            Confirm rejection
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
