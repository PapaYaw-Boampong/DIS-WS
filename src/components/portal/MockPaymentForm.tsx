"use client";

import { useState } from "react";
import { CircleAlert, CreditCard } from "lucide-react";

import { formatPortalCurrency } from "@/lib/portal/format";

type PaymentChild = {
  readonly id: string;
  readonly name: string;
};

type PaymentCategory = {
  readonly value: string;
  readonly label: string;
};

type MockPaymentFormProps = {
  readonly students: readonly PaymentChild[];
  readonly categories: readonly PaymentCategory[];
  readonly defaultCategory?: string;
  readonly title?: string;
  readonly notice?: string;
  readonly submitLabel?: string;
};

export function MockPaymentForm({
  students,
  categories,
  defaultCategory,
  notice = "Secure payment is prepared here, but no payment provider, mobile money prompt, card charge, or backend request will start until the Render payment API is connected.",
  submitLabel = "Start secure payment",
}: MockPaymentFormProps) {
  const [amount, setAmount] = useState("500");
  const [preview, setPreview] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const childId = String(formData.get("child"));
    const categoryValue = String(formData.get("category"));
    const method = String(formData.get("method"));
    const child = students.find((item) => item.id === childId);
    const category = categories.find(
      (item) => item.value === categoryValue,
    );
    const numericAmount = Number(amount);

    if (!child || !category || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setPreview("Enter a valid positive amount to preview this payment.");
      return;
    }

    setPreview(
      `${formatPortalCurrency(numericAmount)} ${category.label.toLowerCase()} payment for ${child.name} by ${method} is ready for backend-secured checkout. No payment was submitted or recorded.`,
    );
  }

  return (
    <div>
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>{notice}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Child
            <select
              name="child"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              {students.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-charcoal">
            Payment category
            <select
              name="category"
              defaultValue={defaultCategory ?? categories[0]?.value}
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

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Amount (GHS)
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>

          <label className="text-sm font-bold text-charcoal">
            Payment method
            <select
              name="method"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              <option>Mobile Money</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <CreditCard aria-hidden="true" className="size-5" />
          {submitLabel}
        </button>
      </form>

      {preview ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold leading-6 text-charcoal"
        >
          {preview}
        </p>
      ) : null}
    </div>
  );
}
