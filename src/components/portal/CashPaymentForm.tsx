"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText } from "lucide-react";

import { recordCashPayment } from "@/app/(portal)/portal/actions/payments";
import { formatPortalCurrency } from "@/lib/portal/format";

type CashPaymentFormProps = {
  readonly students: readonly { id: string; name: string }[];
  readonly invoices: readonly {
    id: string;
    studentId: string;
    balance: number;
  }[];
};

const categories = [
  { value: "school_fees", label: "School Fees" },
  { value: "feeding", label: "Feeding" },
  { value: "transport", label: "Transport" },
  { value: "admission", label: "Admission" },
  { value: "miscellaneous", label: "Miscellaneous" },
] as const;

export function CashPaymentForm({ students, invoices }: CashPaymentFormProps) {
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
    const form = event.currentTarget;
    const formData = new FormData(form);
    const category = String(formData.get("category"));
    const amount = Number(formData.get("amount"));
    const invoiceId = String(formData.get("invoiceId") || "") || undefined;
    const note = String(formData.get("note") || "") || undefined;
    const student = students.find((item) => item.id === studentId);

    if (!student || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Choose a student and a valid positive amount.");
      return;
    }

    startTransition(async () => {
      const result = await recordCashPayment({
        studentId,
        invoiceId,
        category,
        amount,
        note,
      });

      if (!result.ok) {
        setMessage("Could not record the payment. Please try again.");
        return;
      }

      if (result.mode === "real") {
        setMessage(
          `Recorded ${formatPortalCurrency(amount)} cash payment for ${student.name}. Verified immediately — a receipt is available under Documents.`,
        );
        form.reset();
        router.refresh();
      } else {
        setMessage(
          `Cash payment of ${formatPortalCurrency(amount)} for ${student.name} was previewed. No transaction or receipt was recorded.`,
        );
      }
    });
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Cash payments are verified immediately — the invoice is updated and a
        receipt is created for the parent as soon as you save.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Student
          <select
            name="student"
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
            Category
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
          <label className="text-sm font-bold text-charcoal">
            Amount (GHS)
            <input
              type="number"
              name="amount"
              min="1"
              defaultValue="500"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>
        </div>

        <label className="block text-sm font-bold text-charcoal">
          Note (optional)
          <input
            type="text"
            name="note"
            placeholder="e.g. Paid at front desk"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <ReceiptText aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : "Record cash payment"}
        </button>
      </form>
      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
