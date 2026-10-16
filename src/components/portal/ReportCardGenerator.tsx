"use client";

import { useState, useTransition } from "react";
import { FileSpreadsheet } from "lucide-react";

import { generateReportCards } from "@/app/(portal)/portal/actions/report-cards";
import { cn } from "@/lib/utils";

type ReportCardGeneratorProps = {
  readonly classes: readonly { readonly id: string; readonly name: string }[];
  readonly academicYear: string;
  readonly terms: readonly string[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 text-charcoal outline-none transition-colors focus:border-curry-orange";

/**
 * Builds this term's drafts from the class gradebook. Nothing is released
 * here — the drafts land in the list below for checking first.
 */
export function ReportCardGenerator({
  classes,
  academicYear,
  terms,
}: ReportCardGeneratorProps) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [year, setYear] = useState(academicYear);
  const [term, setTerm] = useState(terms[0] ?? "Term 1");
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function prepare() {
    startTransition(async () => {
      const result = await generateReportCards({
        classId,
        academicYear: year,
        term,
      });
      setFailed(!result.ok);
      setMessage(result.message);
    });
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-bold text-charcoal">
          Class
          <select
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className={fieldClass}
          >
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Academic year
          <input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Term
          <select
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            className={fieldClass}
          >
            {terms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={prepare}
        disabled={pending || !classId}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-5 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
      >
        <FileSpreadsheet aria-hidden="true" className="size-4" />
        {pending ? "Preparing…" : "Prepare from gradebook"}
      </button>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm leading-6 font-semibold text-charcoal",
            failed ? "border-red-300 bg-red-50" : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
