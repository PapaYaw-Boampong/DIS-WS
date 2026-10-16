"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";

import {
  getPaystackPaymentState,
  type PaystackPaymentState,
} from "@/app/(portal)/portal/actions/paystack-status";
import { formatPortalCurrency } from "@/lib/portal/format";

type PaystackConfirmPollerProps = {
  readonly reference: string;
  readonly role: string;
  readonly initialState: PaystackPaymentState;
};

// A few spaced attempts, then stop. Webhooks usually land within seconds; if
// they have not, more polling from this page will not help and the parent
// should not be left watching a spinner forever.
const POLL_DELAYS_MS = [2000, 3000, 5000, 8000, 12000];

export function PaystackConfirmPoller({
  reference,
  role,
  initialState,
}: PaystackConfirmPollerProps) {
  const [state, setState] = useState(initialState);
  const [attempt, setAttempt] = useState(0);
  const router = useRouter();
  const settledRef = useRef(false);

  const settled =
    state.status === "verified" ||
    state.status === "failed" ||
    state.status === "abandoned" ||
    state.status === "rejected";

  const poll = useCallback(async () => {
    const next = await getPaystackPaymentState(reference);
    setState(next);
    setAttempt((current) => current + 1);
  }, [reference]);

  useEffect(() => {
    if (settled || attempt >= POLL_DELAYS_MS.length) {
      return;
    }

    const timer = setTimeout(() => {
      void poll();
    }, POLL_DELAYS_MS[attempt]);

    return () => clearTimeout(timer);
  }, [attempt, poll, settled]);

  // Refresh the server components once, so balances and payment history
  // reflect the confirmed payment when the parent navigates away.
  useEffect(() => {
    if (state.status === "verified" && !settledRef.current) {
      settledRef.current = true;
      router.refresh();
    }
  }, [router, state.status]);

  const exhausted = !settled && attempt >= POLL_DELAYS_MS.length;

  return (
    <div>
      {state.status === "verified" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-6 shrink-0 text-emerald-600"
          />
          <div>
            <p className="font-bold text-charcoal">
              Paystack has confirmed this payment
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              {state.amount
                ? `${formatPortalCurrency(state.amount)} has been credited`
                : "Your payment has been credited"}
              {state.channel ? ` (paid by ${state.channel.replace(/_/g, " ")})` : ""}
              . Your receipt is available under Documents.
            </p>
          </div>
        </div>
      ) : null}

      {state.status === "failed" ||
      state.status === "abandoned" ||
      state.status === "rejected" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4">
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-6 shrink-0 text-red-600"
          />
          <div>
            <p className="font-bold text-charcoal">
              This payment was not completed
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              Nothing has been charged for this attempt. You can try again, or
              pay by Mobile Money or bank deposit instead.
            </p>
          </div>
        </div>
      ) : null}

      {!settled ? (
        <div className="flex items-start gap-3 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4">
          {exhausted ? (
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-6 shrink-0 text-curry-orange"
            />
          ) : (
            <Loader2
              aria-hidden="true"
              className="mt-0.5 size-6 shrink-0 animate-spin text-curry-orange motion-reduce:animate-none"
            />
          )}
          <div>
            <p className="font-bold text-charcoal">
              {exhausted
                ? "Still waiting for confirmation"
                : "Waiting for confirmation"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              {exhausted
                ? "Paystack has not confirmed this payment yet. If money left your account it will still be credited automatically — check Payment history shortly, or contact the school office with the reference below."
                : "Your balance updates automatically as soon as Paystack confirms the payment. You can safely leave this page."}
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-sm font-semibold text-muted-grey">
        Reference: <span className="tabular-nums">{reference}</span>
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/portal/${role}/payments`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-curry-orange px-5 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
        >
          Payment history
        </Link>
        <Link
          href={`/portal/${role}/fees/pay`}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
        >
          Back to Pay Now
        </Link>
      </div>
    </div>
  );
}
