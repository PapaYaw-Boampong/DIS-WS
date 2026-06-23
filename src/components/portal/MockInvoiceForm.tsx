"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";

type InvoiceStudent = {
  readonly id: string;
  readonly name: string;
};

type InvoiceFee = {
  readonly id: string;
  readonly title: string;
};

type MockInvoiceFormProps = {
  readonly students: readonly InvoiceStudent[];
  readonly fees: readonly InvoiceFee[];
};

export function MockInvoiceForm({
  students,
  fees,
}: MockInvoiceFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const student = students.find(
      (item) => item.id === String(formData.get("student")),
    );
    const fee = fees.find(
      (item) => item.id === String(formData.get("fee")),
    );

    if (!student || !fee) {
      setMessage("Choose a valid student and fee item.");
      return;
    }

    setMessage(
      `${fee.title} would be assigned to ${student.name}. No invoice was created.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Invoice assignment preview only. No balance or student ledger changes.
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
        <label className="block text-sm font-bold text-charcoal">
          Fee item
          <select name="fee" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
            {fees.map((fee) => (
              <option key={fee.id} value={fee.id}>
                {fee.title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange">
          <FilePlus2 aria-hidden="true" className="size-5" />
          Preview invoice assignment
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
