"use client";

import { CircleAlert, CircleCheck } from "lucide-react";

export type FormOutcome = {
  readonly ok: boolean;
  readonly message: string;
  readonly preview?: Record<string, string>;
};

/**
 * Shared confirmation block for the registry forms: what was captured, or why
 * the record was rejected.
 */
export function FormResult({
  outcome,
}: {
  readonly outcome: FormOutcome | null;
}) {
  if (!outcome) {
    return null;
  }

  return (
    <div
      role="status"
      className={
        outcome.ok
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          : "rounded-2xl border border-red-200 bg-red-50 p-5"
      }
    >
      <p
        className={
          outcome.ok
            ? "flex items-start gap-3 text-sm leading-6 font-bold text-emerald-900"
            : "flex items-start gap-3 text-sm leading-6 font-bold text-red-900"
        }
      >
        {outcome.ok ? (
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        ) : (
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        )}
        {outcome.message}
      </p>

      {outcome.preview ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(outcome.preview).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2"
            >
              <dt className="text-xs font-semibold text-muted-grey">{label}</dt>
              <dd className="text-sm font-bold text-charcoal">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
