"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import type { ClassSummary, StudentProfile } from "@/types/portal";

type MockGradeEntryFormProps = {
  readonly classes: readonly ClassSummary[];
  readonly students: readonly StudentProfile[];
};

export function MockGradeEntryForm({
  classes,
  students,
}: MockGradeEntryFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const studentId = String(formData.get("student"));
    const score = Number(formData.get("score"));
    const total = Number(formData.get("total"));
    const student = students.find((item) => item.id === studentId);

    if (!student || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0 || score < 0 || score > total) {
      setMessage("Enter a valid score that does not exceed the total.");
      return;
    }

    setMessage(
      `${student.fullName}'s ${score}/${total} grade was previewed. No gradebook record was saved or published.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Grade entry preview only. No student result or report card is changed.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
            Student
            <select
              name="student"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Assessment
            <input
              name="assessment"
              defaultValue="Class Test 4"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
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
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            Score
            <input
              type="number"
              name="score"
              min="0"
              defaultValue="16"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>
          <label className="text-sm font-bold text-charcoal">
            Total
            <input
              type="number"
              name="total"
              min="1"
              defaultValue="20"
              className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
            />
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <Save aria-hidden="true" className="size-5" />
          Preview grade entry
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
