"use client";

import { useState } from "react";
import { FilePenLine } from "lucide-react";

import type { ClassSummary } from "@/types/portal";

type MockAssignmentFormProps = {
  readonly classes: readonly ClassSummary[];
};

export function MockAssignmentForm({
  classes,
}: MockAssignmentFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title")).trim();
    const classId = String(formData.get("class"));
    const dueDate = String(formData.get("dueDate"));
    const classItem = classes.find((item) => item.id === classId);

    if (!title || !classItem || !dueDate) {
      setMessage("Complete the title, class, and due date to preview.");
      return;
    }

    setMessage(
      `"${title}" would be assigned to ${classItem.name} for ${dueDate}. Nothing was published.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Assignment creation is a local preview. It does not notify students,
        create a record, or upload an attachment.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Assignment title
          <input
            name="title"
            placeholder="Example: Fractions revision exercise"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Class
            <select
              name="class"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-bold text-charcoal">
            Subject
            <select
              name="subject"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              <option>Mathematics</option>
              <option>Science</option>
            </select>
          </label>
        </div>
        <label className="block text-sm font-bold text-charcoal">
          Instructions
          <textarea
            name="instructions"
            rows={4}
            placeholder="Describe the work students should complete."
            className="mt-2 w-full rounded-2xl border border-border bg-white p-4 font-normal"
          />
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Due date
          <input
            type="date"
            name="dueDate"
            defaultValue="2026-06-30"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <FilePenLine aria-hidden="true" className="size-5" />
          Preview assignment
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
