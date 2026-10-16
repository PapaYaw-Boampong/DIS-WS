"use client";

import { useState, useTransition } from "react";
import { FilePlus2 } from "lucide-react";

import { createInvoice } from "@/app/(portal)/portal/actions/school";
import { cn } from "@/lib/utils";

type InvoiceStudent = {
  readonly id: string;
  readonly name: string;
};

type InvoiceFee = {
  readonly id: string;
  readonly title: string;
  readonly amount?: number;
};

type InvoiceFormProps = {
  readonly students: readonly InvoiceStudent[];
  readonly fees: readonly InvoiceFee[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

/**
 * Raise an invoice for one learner from the fee catalogue. Several fee items
 * can go on one invoice — a term's bill is usually school fees plus feeding
 * plus whatever else applies, not one line each.
 *
 * The total is deliberately not sent: the server recomputes it from the
 * catalogue so the browser cannot decide what a family owes.
 */
export function InvoiceForm({ students, fees }: InvoiceFormProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [selectedFees, setSelectedFees] = useState<ReadonlySet<string>>(new Set());
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const estimated = fees
    .filter((fee) => selectedFees.has(fee.id))
    .reduce((sum, fee) => sum + (fee.amount ?? 0), 0);

  function toggleFee(id: string) {
    setSelectedFees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createInvoice({
        studentId,
        feeItemIds: [...selectedFees],
        dueDate,
      });

      setFailed(!result.ok);
      setMessage(result.message);
      if (result.ok) setSelectedFees(new Set());
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Learner
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className={fieldClass}
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-bold text-charcoal">Fee items</legend>
          <div className="mt-2 max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-border bg-white p-3">
            {fees.map((fee) => (
              <label
                key={fee.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-charcoal hover:bg-soft-white"
              >
                <input
                  type="checkbox"
                  checked={selectedFees.has(fee.id)}
                  onChange={() => toggleFee(fee.id)}
                  className="size-5 shrink-0 accent-[var(--color-curry-orange,#e07a1f)]"
                />
                <span className="font-semibold">{fee.title}</span>
                {typeof fee.amount === "number" ? (
                  <span className="ml-auto text-muted-grey">
                    GHS {fee.amount.toLocaleString("en-GH")}
                  </span>
                ) : null}
              </label>
            ))}
            {fees.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-grey">
                No fee items yet. Add one to the catalogue first.
              </p>
            ) : null}
          </div>
        </fieldset>

        <label className="block text-sm font-bold text-charcoal">
          Due date (optional)
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={fieldClass}
          />
        </label>

        <p className="text-sm font-semibold text-muted-grey">
          {selectedFees.size} item{selectedFees.size === 1 ? "" : "s"} selected
          {estimated > 0 ? ` · about GHS ${estimated.toLocaleString("en-GH")}` : ""}
        </p>

        <button
          type="submit"
          disabled={pending || selectedFees.size === 0}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <FilePlus2 aria-hidden="true" className="size-5" />
          {pending ? "Raising…" : "Raise invoice"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm font-semibold text-charcoal",
            failed ? "border-red-300 bg-red-50" : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
