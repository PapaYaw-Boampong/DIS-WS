"use client";

import { useMemo, useState, useTransition } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

import { initializePaystackPayment } from "@/app/(portal)/portal/actions/payments";
import { formatPortalCurrency } from "@/lib/portal/format";

type PaystackPaymentFormProps = {
  readonly students: readonly { id: string; name: string }[];
  readonly invoices: readonly {
    id: string;
    studentId: string;
    balance: number;
  }[];
  readonly categories: readonly { value: string; label: string }[];
  readonly defaultStudentId?: string;
  readonly defaultCategory?: string;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

/**
 * Pay inside the portal via Paystack's hosted checkout.
 *
 * The browser is redirected to Paystack rather than running their Inline JS
 * widget: no third-party script on the portal origin, no CSP changes, and no
 * card data ever reaches this application. The cost is one page transition.
 */
export function PaystackPaymentForm({
  students,
  invoices,
  categories,
  defaultStudentId,
  defaultCategory,
}: PaystackPaymentFormProps) {
  const [studentId, setStudentId] = useState(
    defaultStudentId ?? students[0]?.id ?? "",
  );
  const [invoiceId, setInvoiceId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const studentInvoices = useMemo(
    () =>
      invoices.filter(
        (invoice) => invoice.studentId === studentId && invoice.balance > 0,
      ),
    [invoices, studentId],
  );

  const selectedInvoice = studentInvoices.find(
    (invoice) => invoice.id === invoiceId,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = String(formData.get("category"));
    const amount = Number(formData.get("amount"));
    const student = students.find((item) => item.id === studentId);

    if (!student || !Number.isInteger(amount) || amount <= 0) {
      setMessage("Choose a child and enter a whole-cedi amount above zero.");
      return;
    }

    if (selectedInvoice && amount > selectedInvoice.balance) {
      setMessage(
        `That is more than the ${formatPortalCurrency(selectedInvoice.balance)} outstanding on this invoice. Pay the balance here, or see the office to pay in advance.`,
      );
      return;
    }

    startTransition(async () => {
      const result = await initializePaystackPayment({
        studentId,
        invoiceId: invoiceId || undefined,
        category,
        amount,
      });

      if (!result.ok || !result.authorizationUrl) {
        setMessage(
          result.error === "amount_exceeds_balance"
            ? "That is more than the outstanding balance on this invoice."
            : result.error === "parent_email_required"
              ? "Your account has no email address on file. Ask the office to add one before paying online."
              : "Online payment is not available right now. Please use Mobile Money or a bank deposit.",
        );
        return;
      }

      // Full navigation, not a router push — this leaves the app for Paystack.
      window.location.href = result.authorizationUrl;
    });
  }

  return (
    <div>
      <div className="flex items-start gap-3 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm text-charcoal">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-curry-orange"
        />
        <div className="space-y-1">
          <p className="font-bold">Pay by card or Mobile Money, instantly</p>
          <p className="leading-6 text-muted-grey">
            You will be taken to Paystack&apos;s secure checkout to finish the
            payment. Your balance updates automatically once it is confirmed —
            nobody at the school has to verify it first.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Child
            <select
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setInvoiceId("");
              }}
              className={fieldClass}
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
              defaultValue={defaultCategory}
              className={fieldClass}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-bold text-charcoal">
          Apply to invoice (optional)
          <select
            value={invoiceId}
            onChange={(event) => setInvoiceId(event.target.value)}
            className={fieldClass}
          >
            <option value="">Not tied to an invoice</option>
            {studentInvoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.id.toUpperCase()} — {formatPortalCurrency(invoice.balance)}{" "}
                outstanding
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Amount (GHS)
          <input
            type="number"
            name="amount"
            min="1"
            step="1"
            defaultValue={selectedInvoice?.balance ?? ""}
            className={fieldClass}
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <CreditCard aria-hidden="true" className="size-5" />
          {pending ? "Opening checkout…" : "Pay with Paystack"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold leading-6 text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
