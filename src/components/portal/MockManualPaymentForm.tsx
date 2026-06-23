"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";

type PaymentStudent = {
  readonly id: string;
  readonly name: string;
};

type MockManualPaymentFormProps = {
  readonly students: readonly PaymentStudent[];
};

export function MockManualPaymentForm({
  students,
}: MockManualPaymentFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const student = students.find(
      (item) => item.id === String(formData.get("student")),
    );
    const amount = Number(formData.get("amount"));

    if (!student || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Choose a valid student and positive amount.");
      return;
    }

    setMessage(
      `Manual payment of GHS ${amount.toLocaleString("en-GH")} for ${student.name} was previewed. No transaction or receipt was recorded.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Manual payment preview only. It does not reconcile an invoice or create
        a receipt.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Student
          <select name="student" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Amount (GHS)
            <input type="number" name="amount" min="1" defaultValue="500" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal" />
          </label>
          <label className="text-sm font-bold text-charcoal">
            Method
            <select name="method" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Manual Entry</option>
            </select>
          </label>
        </div>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange">
          <ReceiptText aria-hidden="true" className="size-5" />
          Preview manual payment
        </button>
      </form>
      {message ? (
        <p role="status" className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal">
          {message}
        </p>
      ) : null}
    </div>
  );
}
