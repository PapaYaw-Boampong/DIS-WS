"use client";

import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";

import {
  cellKey,
  type GradebookStudent,
  type GradeColumn,
} from "@/components/portal/gradebook/types";

type GradebookGridProps = {
  readonly students: readonly GradebookStudent[];
  readonly columns: readonly GradeColumn[];
  readonly scores: Record<string, string>;
  readonly onScoreChange: (
    studentId: string,
    columnId: string,
    value: string,
  ) => void;
  readonly onAddColumn: (title: string, total: number) => void;
  readonly onOpenSpeedGrader: (columnId: string) => void;
};

function studentPercent(
  studentId: string,
  columns: readonly GradeColumn[],
  scores: Record<string, string>,
): number | null {
  let earned = 0;
  let possible = 0;

  for (const column of columns) {
    const raw = scores[cellKey(studentId, column.id)];
    const value = raw === undefined ? NaN : Number(raw);

    if (raw !== undefined && raw !== "" && !Number.isNaN(value)) {
      earned += value;
      possible += column.total;
    }
  }

  if (possible === 0) {
    return null;
  }

  return Math.round((earned / possible) * 100);
}

export function GradebookGrid({
  students,
  columns,
  scores,
  onScoreChange,
  onAddColumn,
  onOpenSpeedGrader,
}: GradebookGridProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newTotal, setNewTotal] = useState("20");

  function handleAddColumn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    const total = Number(newTotal);

    if (!title || Number.isNaN(total) || total <= 0) {
      return;
    }

    onAddColumn(title, total);
    setNewTitle("");
    setNewTotal("20");
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleAddColumn}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-soft-white p-4"
      >
        <label className="text-sm font-bold text-charcoal">
          New assignment
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Example: Class Test 4"
            className="mt-2 block min-h-11 w-56 rounded-2xl border border-border bg-white px-4 text-sm font-normal"
          />
        </label>
        <label className="text-sm font-bold text-charcoal">
          Out of
          <input
            value={newTotal}
            onChange={(event) => setNewTotal(event.target.value)}
            inputMode="numeric"
            className="mt-2 block min-h-11 w-24 rounded-2xl border border-border bg-white px-4 text-sm font-normal"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add column
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full border-collapse text-sm">
          <caption className="sr-only">Editable class gradebook</caption>
          <thead>
            <tr className="bg-soft-white">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-44 bg-soft-white px-4 py-3 text-left font-bold text-charcoal"
              >
                Student
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="min-w-32 px-3 py-3 text-left font-bold text-charcoal"
                >
                  <span className="flex items-center gap-2">
                    <span>
                      {column.title}
                      <span className="block text-xs font-semibold text-muted-grey">
                        {column.subject} · /{column.total}
                        {column.isNew ? " · new" : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenSpeedGrader(column.id)}
                      title={`Open SpeedGrader for ${column.title}`}
                      aria-label={`Open SpeedGrader for ${column.title}`}
                      className="text-deep-orange transition-colors hover:text-curry-orange"
                    >
                      <SquarePen aria-hidden="true" className="size-4" />
                    </button>
                  </span>
                </th>
              ))}
              <th
                scope="col"
                className="min-w-24 px-3 py-3 text-left font-bold text-charcoal"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const percent = studentPercent(student.id, columns, scores);

              return (
                <tr key={student.id} className="border-t border-border">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-semibold text-charcoal"
                  >
                    {student.fullName}
                  </th>
                  {columns.map((column) => {
                    const key = cellKey(student.id, column.id);

                    return (
                      <td key={column.id} className="px-3 py-2">
                        <input
                          value={scores[key] ?? ""}
                          onChange={(event) =>
                            onScoreChange(
                              student.id,
                              column.id,
                              event.target.value,
                            )
                          }
                          inputMode="numeric"
                          aria-label={`${student.fullName} — ${column.title}`}
                          placeholder="—"
                          className="min-h-10 w-20 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-charcoal tabular-nums focus:border-curry-orange focus:outline-none"
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 font-bold text-charcoal tabular-nums">
                    {percent === null ? "—" : `${percent}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
