"use client";

import { useState } from "react";
import { BadgePlus } from "lucide-react";

export function MockFeeItemForm() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title")).trim();
    const amount = Number(formData.get("amount"));

    if (!title || !Number.isFinite(amount) || amount <= 0) {
      setMessage("Enter a fee title and a valid positive amount.");
      return;
    }

    setMessage(
      `"${title}" for GHS ${amount.toLocaleString("en-GH")} was previewed. No fee item or invoice was created.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Fee setup preview only. No student account, invoice, or finance record
        is changed.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Fee title
          <input
            name="title"
            placeholder="Example: Term 2 School Fees"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Category
            <select
              name="category"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              <option>School Fees</option>
              <option>Feeding Fees</option>
              <option>Transport Fees</option>
              <option>Books & Materials</option>
              <option>Examination Fees</option>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Term
            <select
              name="term"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </label>
          <label className="text-sm font-bold text-charcoal">
            Due date
            <input
              type="date"
              name="dueDate"
              defaultValue="2026-09-18"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <BadgePlus aria-hidden="true" className="size-5" />
          Preview fee item
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
