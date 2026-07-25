"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";

import { submitMomoPayment } from "@/app/(portal)/portal/actions/payments";
import { momoMerchant } from "@/lib/portal/payment-config";
import { formatPortalCurrency } from "@/lib/portal/format";

type MomoPaymentFormProps = {
  readonly students: readonly { id: string; name: string }[];
  readonly invoices: readonly {
    id: string;
    studentId: string;
    balance: number;
  }[];
  readonly categories: readonly { value: string; label: string }[];
};

export function MomoPaymentForm({
  students,
  invoices,
  categories,
}: MomoPaymentFormProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const studentInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) => invoice.studentId === studentId && invoice.balance > 0,
      ),
    [invoices, studentId],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Capture the element now — `event.currentTarget` is nulled by the DOM
    // once dispatch finishes, so it can't be read inside the async callback.
    const form = event.currentTarget;
    const formData = new FormData(form);
    const category = String(formData.get("category"));
    const amount = Number(formData.get("amount"));
    const reference = String(formData.get("reference")).trim();
    const invoiceId = String(formData.get("invoiceId") || "") || undefined;
    const student = students.find((item) => item.id === studentId);

    if (!student || !Number.isFinite(amount) || amount <= 0 || !reference) {
      setMessage("Choose a child, enter a valid amount, and paste the transaction reference.");
      return;
    }

    startTransition(async () => {
      const result = await submitMomoPayment({
        studentId,
        invoiceId,
        category,
        amount,
        reference,
      });

      if (!result.ok) {
        setMessage(
          result.error === "duplicate_reference"
            ? "That transaction reference has already been submitted."
            : "Could not submit the payment. Please try again.",
        );
        return;
      }

      if (result.mode === "real") {
        setMessage(
          `Submitted for ${student.name}. It will show as Pending until the school verifies it against the MoMo statement.`,
        );
        form.reset();
        router.refresh();
      } else {
        setMessage(
          `${formatPortalCurrency(amount)} MoMo payment for ${student.name} is ready for backend-secured submission. No payment was submitted (preview).`,
        );
      }
    });
  }

  return (
    <div>
      <div className="flex items-start gap-3 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm text-charcoal">
        <Smartphone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-curry-orange" />
        <div className="space-y-2">
          <p className="font-bold">
            Pay to {momoMerchant.merchantName} — {momoMerchant.network}
          </p>
          <p className="text-lg font-extrabold text-deep-orange">
            {momoMerchant.merchantNumber}
          </p>
          <ol className="list-decimal space-y-1 pl-4 text-sm leading-6 text-muted-grey">
            {momoMerchant.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Child
            <select
              name="child"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-charcoal">
            Payment category
            <select
              name="category"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {studentInvoices.length > 0 ? (
          <label className="block text-sm font-bold text-charcoal">
            Apply to invoice (optional)
            <select
              name="invoiceId"
              defaultValue=""
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              <option value="">No specific invoice</option>
              {studentInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  Outstanding balance: {formatPortalCurrency(invoice.balance)}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Amount (GHS)
            <input
              type="number"
              name="amount"
              min="1"
              step="1"
              defaultValue="500"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>

          <label className="text-sm font-bold text-charcoal">
            MoMo transaction reference
            <input
              type="text"
              name="reference"
              placeholder="e.g. 123456789"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Smartphone aria-hidden="true" className="size-5" />
          {pending ? "Submitting…" : "Submit for verification"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold leading-6 text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
