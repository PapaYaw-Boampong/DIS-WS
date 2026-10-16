"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowRight, MoveUp } from "lucide-react";

import {
  promoteStudents,
  type PromotionEntry,
} from "@/app/(portal)/portal/actions/registry";
import { FormResult, type FormOutcome } from "@/components/portal/forms/FormResult";
import { cn } from "@/lib/utils";

type ClassOption = {
  readonly id: string;
  readonly name: string;
  readonly level: string;
};

type StudentOption = {
  readonly id: string;
  readonly fullName: string;
  readonly studentId: string;
  readonly classId: string;
  readonly status: string;
};

type PromotionWorkspaceProps = {
  readonly classes: readonly ClassOption[];
  readonly students: readonly StudentOption[];
  readonly academicYears: readonly string[];
};

type Outcome = PromotionEntry["outcome"];

const outcomeLabels: Record<Outcome, string> = {
  promote: "Promote",
  repeat: "Repeat year",
  graduate: "Graduate",
  transfer: "Transfer out",
};

// The class after this one in the school's own order — the default target.
function nextClassId(classes: readonly ClassOption[], fromId: string) {
  const index = classes.findIndex((item) => item.id === fromId);
  return index >= 0 && index < classes.length - 1
    ? classes[index + 1].id
    : "";
}

export function PromotionWorkspace({
  classes,
  students,
  academicYears,
}: PromotionWorkspaceProps) {
  const [fromClassId, setFromClassId] = useState(classes[0]?.id ?? "");
  const [toClassId, setToClassId] = useState(() =>
    nextClassId(classes, classes[0]?.id ?? ""),
  );
  const [academicYear, setAcademicYear] = useState(academicYears[0] ?? "");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [result, setResult] = useState<FormOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  const cohort = useMemo(
    () => students.filter((student) => student.classId === fromClassId),
    [students, fromClassId],
  );

  function changeSourceClass(id: string) {
    setFromClassId(id);
    setToClassId(nextClassId(classes, id));
    setSelected(new Set());
    setOutcomes({});
    setResult(null);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectAll() {
    setSelected(
      new Set(
        cohort
          .filter((student) => student.status === "active")
          .map((student) => student.id),
      ),
    );
  }

  function apply() {
    const entries: PromotionEntry[] = [...selected].map((id) => {
      const student = cohort.find((item) => item.id === id);
      const outcome = outcomes[id] ?? "promote";

      return {
        studentId: id,
        studentName: student?.fullName ?? id,
        fromClassId,
        toClassId: outcome === "promote" ? toClassId : fromClassId,
        outcome,
      };
    });

    startTransition(async () => {
      const response = await promoteStudents(academicYear, entries);
      setResult(response);

      if (response.ok) {
        setSelected(new Set());
        setOutcomes({});
      }
    });
  }

  const targetClass = classes.find((item) => item.id === toClassId);

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block text-sm font-bold text-charcoal">
          From class
          <select
            value={fromClassId}
            onChange={(event) => changeSourceClass(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal text-charcoal"
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-charcoal">
          To class
          <select
            value={toClassId}
            onChange={(event) => setToClassId(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal text-charcoal"
          >
            <option value="">Leaving the school</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Academic year
          <select
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal text-charcoal"
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-soft-cream p-4">
        <span className="text-sm font-bold text-charcoal">
          {classes.find((item) => item.id === fromClassId)?.name ?? "—"}
        </span>
        <ArrowRight aria-hidden="true" className="size-4 text-curry-orange" />
        <span className="text-sm font-bold text-charcoal">
          {targetClass?.name ?? "Leaving the school"}
        </span>
        <span className="text-sm text-muted-grey">
          · {selected.size} of {cohort.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={selectAll}
          disabled={cohort.length === 0}
          className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
        >
          Select whole class
        </button>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          disabled={selected.size === 0}
          className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
        >
          Clear selection
        </button>
      </div>

      <ul className="space-y-2">
        {cohort.map((student) => {
          const isSelected = selected.has(student.id);
          const outcome = outcomes[student.id] ?? "promote";

          return (
            <li
              key={student.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4",
                isSelected
                  ? "border-curry-orange bg-soft-cream"
                  : "border-border bg-soft-white",
              )}
            >
              <label className="flex min-w-0 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(student.id)}
                  className="size-5 shrink-0 accent-[#e07a1f]"
                />
                <span className="min-w-0">
                  <span className="block font-bold text-charcoal">
                    {student.fullName}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-grey">
                    {student.studentId}
                    {student.status !== "active"
                      ? ` · ${student.status}`
                      : ""}
                  </span>
                </span>
              </label>

              <select
                value={outcome}
                onChange={(event) =>
                  setOutcomes((prev) => ({
                    ...prev,
                    [student.id]: event.target.value as Outcome,
                  }))
                }
                disabled={!isSelected}
                aria-label={`Outcome for ${student.fullName}`}
                className="min-h-10 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-charcoal disabled:opacity-40"
              >
                {Object.entries(outcomeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ul>

      {cohort.length === 0 ? (
        <p className="text-sm text-muted-grey">
          No learners are recorded in this class.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <button
          type="button"
          onClick={apply}
          disabled={pending || selected.size === 0}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-50"
        >
          <MoveUp aria-hidden="true" className="size-5" />
          {pending
            ? "Applying…"
            : `Progress ${selected.size} learner${selected.size === 1 ? "" : "s"}`}
        </button>
      </div>

      <FormResult outcome={result} />
    </div>
  );
}
