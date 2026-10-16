"use client";

import { useState, useTransition } from "react";
import { BadgePlus } from "lucide-react";

import { createFeeItem } from "@/app/(portal)/portal/actions/school";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

// The label is what the office calls it; the value is what the finance domain
// stores. Sending the label would create a category nothing else recognises.
const categories = [
  { value: "school_fees", label: "School Fees" },
  { value: "feeding", label: "Feeding Fees" },
  { value: "transport", label: "Transport Fees" },
  { value: "admission", label: "Admission Fees" },
  { value: "books", label: "Books & Materials" },
  { value: "uniform", label: "Uniform" },
  { value: "exam", label: "Examination Fees" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

const terms = ["Term 1", "Term 2", "Term 3"];

type FeeItemFormProps = {
  readonly academicYear?: string;
};

export function FeeItemForm({ academicYear = "2025/2026" }: FeeItemFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createFeeItem({
        title: String(formData.get("title") ?? ""),
        category: String(formData.get("category") ?? "school_fees"),
        amount: Number(formData.get("amount")),
        term: String(formData.get("term") ?? "Term 1"),
        academicYear: String(formData.get("academicYear") ?? academicYear),
        dueDate: String(formData.get("dueDate") ?? ""),
      });

      setFailed(!result.ok);
      setMessage(result.message);
      if (result.ok) form.reset();
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Fee title
          <input
            name="title"
            placeholder="Example: Term 2 School Fees"
            className={fieldClass}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Category
            <select name="category" className={fieldClass}>
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
              step="1"
              defaultValue="500"
              className={fieldClass}
            />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className="text-sm font-bold text-charcoal">
            Term
            <select name="term" className={fieldClass}>
              {terms.map((term) => (
                <option key={term}>{term}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-charcoal">
            Academic year
            <input
              name="academicYear"
              defaultValue={academicYear}
              className={fieldClass}
            />
          </label>
          <label className="text-sm font-bold text-charcoal">
            Due date
            <input type="date" name="dueDate" className={fieldClass} />
          </label>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <BadgePlus aria-hidden="true" className="size-5" />
          {pending ? "Adding…" : "Add fee item"}
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
