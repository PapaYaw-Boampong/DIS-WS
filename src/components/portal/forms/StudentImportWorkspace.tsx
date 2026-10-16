"use client";

import { useMemo, useState, useTransition } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import {
  importStudentRows,
  type ImportedStudentRow,
} from "@/app/(portal)/portal/actions/registry";
import { FormResult, type FormOutcome } from "@/components/portal/forms/FormResult";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { downloadCsv, readSpreadsheet, type SheetData } from "@/lib/portal/spreadsheet";
import { cn } from "@/lib/utils";

type StudentImportWorkspaceProps = {
  readonly classNames: readonly string[];
  readonly existingStudentIds: readonly string[];
};

type FieldKey = keyof ImportedStudentRow;

const fields: readonly {
  readonly key: FieldKey;
  readonly label: string;
  readonly required?: boolean;
  // Header names we recognise without the user mapping anything.
  readonly aliases: readonly string[];
}[] = [
  { key: "fullName", label: "Full name", required: true, aliases: ["full name", "name", "student name", "learner"] },
  { key: "studentId", label: "Student ID", aliases: ["student id", "id", "admission number", "index number"] },
  { key: "className", label: "Class", required: true, aliases: ["class", "class name", "grade", "form"] },
  { key: "level", label: "Level", aliases: ["level", "section", "department"] },
  { key: "dateOfBirth", label: "Date of birth", aliases: ["date of birth", "dob", "birth date"] },
  { key: "gender", label: "Gender", aliases: ["gender", "sex"] },
  { key: "guardianName", label: "Guardian name", aliases: ["guardian", "guardian name", "parent", "parent name"] },
  { key: "guardianPhone", label: "Guardian phone", aliases: ["guardian phone", "parent phone", "phone", "contact"] },
  { key: "guardianEmail", label: "Guardian email", aliases: ["guardian email", "parent email", "email"] },
];

const templateHeaders = fields.map((field) => field.label);

function autoMap(headers: readonly string[]) {
  const mapping: Partial<Record<FieldKey, number>> = {};

  fields.forEach((field) => {
    const index = headers.findIndex((header) =>
      field.aliases.includes(header.trim().toLowerCase()),
    );

    if (index >= 0) {
      mapping[field.key] = index;
    }
  });

  return mapping;
}

export function StudentImportWorkspace({
  classNames,
  existingStudentIds,
}: StudentImportWorkspaceProps) {
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, number>>>({});
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<FormOutcome | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);
    setOutcome(null);

    try {
      const data = await readSpreadsheet(file);

      if (!data.headers.length) {
        setError("That file has no header row.");
        return;
      }

      setSheet(data);
      setFileName(file.name);
      setMapping(autoMap(data.headers));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "That file could not be read. Try saving it as CSV.",
      );
    }
  }

  // Each row is validated against the school's classes and existing IDs.
  const checked = useMemo(() => {
    if (!sheet) {
      return [];
    }

    const seen = new Set<string>();
    const known = new Set(classNames.map((name) => name.toLowerCase()));
    const taken = new Set(existingStudentIds.map((id) => id.toLowerCase()));

    return sheet.rows.map((row, index) => {
      const read = (key: FieldKey) => {
        const column = mapping[key];
        return column === undefined ? "" : (row[column] ?? "").trim();
      };

      const record: ImportedStudentRow = {
        fullName: read("fullName"),
        studentId: read("studentId"),
        className: read("className"),
        level: read("level"),
        dateOfBirth: read("dateOfBirth"),
        gender: read("gender"),
        guardianName: read("guardianName"),
        guardianPhone: read("guardianPhone"),
        guardianEmail: read("guardianEmail"),
      };

      const issues: string[] = [];

      if (!record.fullName) {
        issues.push("Missing name");
      }

      if (!record.className) {
        issues.push("Missing class");
      } else if (!known.has(record.className.toLowerCase())) {
        issues.push(`Unknown class "${record.className}"`);
      }

      if (record.studentId) {
        const key = record.studentId.toLowerCase();

        if (taken.has(key)) {
          issues.push("Student ID already on the register");
        } else if (seen.has(key)) {
          issues.push("Duplicate ID in this file");
        }

        seen.add(key);
      }

      return { line: index + 2, record, issues };
    });
  }, [sheet, mapping, classNames, existingStudentIds]);

  const valid = checked.filter((entry) => entry.issues.length === 0);
  const rejected = checked.length - valid.length;

  function runImport() {
    startTransition(async () => {
      const result = await importStudentRows(
        valid.map((entry) => entry.record),
      );
      setOutcome(result);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-curry-orange px-5 font-bold text-white transition-colors hover:bg-deep-orange">
          <Upload aria-hidden="true" className="size-5" />
          Choose file
          <input
            type="file"
            accept=".csv,.tsv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => void handleFile(event.target.files?.[0])}
            className="sr-only"
          />
        </label>
        <button
          type="button"
          onClick={() =>
            downloadCsv("dis-student-import-template.csv", templateHeaders, [
              [
                "Mensah Ama",
                "DIS-2026-009",
                "Primary 6",
                "Primary School",
                "2014-05-02",
                "Female",
                "Grace Mensah",
                "+233 20 000 0001",
                "grace@example.com",
              ],
            ])
          }
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-curry-orange px-5 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
        >
          <FileSpreadsheet aria-hidden="true" className="size-5" />
          Download template
        </button>
        {fileName ? (
          <p className="text-sm font-semibold text-muted-grey">{fileName}</p>
        ) : (
          <p className="text-sm text-muted-grey">
            Excel (.xlsx) or CSV, with a header row.
          </p>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      ) : null}

      {sheet ? (
        <>
          <section>
            <h3 className="text-base font-extrabold text-charcoal">
              Match the columns
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-grey">
              Columns recognised from the header row are matched already. Adjust
              anything the school names differently.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className="block text-sm font-bold text-charcoal"
                >
                  {field.label}
                  {field.required ? (
                    <span aria-hidden="true" className="ml-1 text-deep-orange">
                      *
                    </span>
                  ) : null}
                  <select
                    value={mapping[field.key] ?? -1}
                    onChange={(event) =>
                      setMapping((prev) => ({
                        ...prev,
                        [field.key]:
                          Number(event.target.value) < 0
                            ? undefined
                            : Number(event.target.value),
                      }))
                    }
                    className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal text-charcoal"
                  >
                    <option value={-1}>Not in this file</option>
                    {sheet.headers.map((header, index) => (
                      <option key={`${header}-${index}`} value={index}>
                        {header || `Column ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-extrabold text-charcoal">
                Preview
              </h3>
              <div className="flex items-center gap-3">
                <StatusBadge variant="success">{`${valid.length} ready`}</StatusBadge>
                {rejected ? (
                  <StatusBadge variant="danger">{`${rejected} to fix`}</StatusBadge>
                ) : null}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse text-left">
                <caption className="sr-only">Rows found in the upload</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 text-sm font-bold text-charcoal">Row</th>
                    <th className="py-3 text-sm font-bold text-charcoal">Name</th>
                    <th className="py-3 text-sm font-bold text-charcoal">Student ID</th>
                    <th className="py-3 text-sm font-bold text-charcoal">Class</th>
                    <th className="py-3 text-sm font-bold text-charcoal">Guardian</th>
                    <th className="py-3 text-sm font-bold text-charcoal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {checked.slice(0, 50).map((entry) => (
                    <tr
                      key={entry.line}
                      className={cn(
                        "border-b border-border/70",
                        entry.issues.length > 0 && "bg-red-50/50",
                      )}
                    >
                      <td className="py-3 text-sm text-muted-grey tabular-nums">
                        {entry.line}
                      </td>
                      <td className="py-3 text-sm font-bold text-charcoal">
                        {entry.record.fullName || "—"}
                      </td>
                      <td className="py-3 text-sm text-muted-grey">
                        {entry.record.studentId || "Assigned on save"}
                      </td>
                      <td className="py-3 text-sm text-muted-grey">
                        {entry.record.className || "—"}
                      </td>
                      <td className="py-3 text-sm text-muted-grey">
                        {entry.record.guardianName || "—"}
                        {entry.record.guardianPhone
                          ? ` · ${entry.record.guardianPhone}`
                          : ""}
                      </td>
                      <td className="py-3 text-sm">
                        {entry.issues.length ? (
                          <span className="font-semibold text-red-700">
                            {entry.issues.join("; ")}
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-700">
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {checked.length > 50 ? (
              <p className="mt-3 text-sm text-muted-grey">
                Showing the first 50 of {checked.length} rows. All valid rows are
                imported.
              </p>
            ) : null}
          </section>

          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
            <button
              type="button"
              onClick={runImport}
              disabled={pending || valid.length === 0}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-50"
            >
              <Upload aria-hidden="true" className="size-5" />
              {pending
                ? "Importing…"
                : `Import ${valid.length} learner${valid.length === 1 ? "" : "s"}`}
            </button>
            {rejected ? (
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    "import-rows-to-fix.csv",
                    [...templateHeaders, "Problem"],
                    checked
                      .filter((entry) => entry.issues.length)
                      .map((entry) => [
                        entry.record.fullName,
                        entry.record.studentId,
                        entry.record.className,
                        entry.record.level,
                        entry.record.dateOfBirth,
                        entry.record.gender,
                        entry.record.guardianName,
                        entry.record.guardianPhone,
                        entry.record.guardianEmail,
                        entry.issues.join("; "),
                      ]),
                  )
                }
                className="inline-flex min-h-12 items-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Download rows to fix
              </button>
            ) : null}
          </div>

          <FormResult outcome={outcome} />
        </>
      ) : null}
    </div>
  );
}
