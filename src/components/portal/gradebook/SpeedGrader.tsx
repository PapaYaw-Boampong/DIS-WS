"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

import {
  cellKey,
  type GradebookStudent,
  type GradeColumn,
} from "@/components/portal/gradebook/types";

type SpeedGraderProps = {
  readonly students: readonly GradebookStudent[];
  readonly columns: readonly GradeColumn[];
  readonly activeColumnId: string;
  readonly onSelectColumn: (columnId: string) => void;
  readonly scores: Record<string, string>;
  readonly onScoreChange: (
    studentId: string,
    columnId: string,
    value: string,
  ) => void;
  readonly feedback: Record<string, string>;
  readonly onFeedbackChange: (key: string, value: string) => void;
};

export function SpeedGrader({
  students,
  columns,
  activeColumnId,
  onSelectColumn,
  scores,
  onScoreChange,
  feedback,
  onFeedbackChange,
}: SpeedGraderProps) {
  const [index, setIndex] = useState(0);

  const column =
    columns.find((item) => item.id === activeColumnId) ?? columns[0];
  const student = students[index];

  if (!column || !student) {
    return (
      <p className="rounded-2xl border border-border bg-soft-white p-4 text-sm text-muted-grey">
        Add an assignment column and a class roster to use SpeedGrader.
      </p>
    );
  }

  const key = cellKey(student.id, column.id);

  function move(delta: number) {
    setIndex((current) => {
      const next = current + delta;

      if (next < 0) return 0;
      if (next > students.length - 1) return students.length - 1;

      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="text-sm font-bold text-charcoal">
          Assignment
          <select
            value={column.id}
            onChange={(event) => onSelectColumn(event.target.value)}
            className="mt-2 block min-h-11 min-w-56 rounded-2xl border border-border bg-white px-4 text-sm font-normal"
          >
            {columns.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.subject})
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={index === 0}
            className="flex size-10 items-center justify-center rounded-full border border-border text-charcoal transition-colors hover:border-curry-orange/40 disabled:opacity-40"
            aria-label="Previous student"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <span className="text-sm font-bold text-muted-grey">
            {index + 1} / {students.length}
          </span>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={index >= students.length - 1}
            className="flex size-10 items-center justify-center rounded-full border border-border text-charcoal transition-colors hover:border-curry-orange/40 disabled:opacity-40"
            aria-label="Next student"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-2xl border border-border bg-soft-white p-6">
          <p className="text-xs font-bold tracking-[0.12em] text-curry-orange uppercase">
            Submission
          </p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {student.fullName}
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-border bg-white p-5 text-sm text-muted-grey">
            <FileText aria-hidden="true" className="size-6 text-curry-orange" />
            <span>
              Submission preview is fictional. No student file is attached in
              this phase.
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6">
          <label className="block text-sm font-bold text-charcoal">
            Score
            <span className="mt-2 flex items-center gap-2">
              <input
                value={scores[key] ?? ""}
                onChange={(event) =>
                  onScoreChange(student.id, column.id, event.target.value)
                }
                inputMode="numeric"
                placeholder="—"
                className="min-h-11 w-24 rounded-2xl border border-border bg-white px-4 text-lg font-bold text-charcoal tabular-nums focus:border-curry-orange focus:outline-none"
              />
              <span className="text-sm font-semibold text-muted-grey">
                / {column.total}
              </span>
            </span>
          </label>

          <label className="mt-5 block text-sm font-bold text-charcoal">
            Feedback
            <textarea
              value={feedback[key] ?? ""}
              onChange={(event) => onFeedbackChange(key, event.target.value)}
              rows={4}
              placeholder="Add a comment for this student."
              className="mt-2 w-full rounded-2xl border border-border bg-white p-3 text-sm font-normal"
            />
          </label>

          <button
            type="button"
            onClick={() => move(1)}
            disabled={index >= students.length - 1}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-curry-orange px-5 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
          >
            Save &amp; next
          </button>
          <p className="mt-3 text-xs text-muted-grey">
            Scores and feedback stay in your browser and are not saved to a
            student record.
          </p>
        </div>
      </div>
    </div>
  );
}
