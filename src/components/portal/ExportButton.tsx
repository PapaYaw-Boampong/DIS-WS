"use client";

import { Download } from "lucide-react";

import { downloadCsv, type SheetRow } from "@/lib/portal/spreadsheet";

type ExportButtonProps = {
  readonly fileName: string;
  readonly headers: readonly string[];
  readonly rows: readonly SheetRow[];
  readonly label?: string;
};

/**
 * Downloads the given table as a CSV file, which Excel and Google Sheets both
 * open directly.
 */
export function ExportButton({
  fileName,
  headers,
  rows,
  label = "Export",
}: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(fileName, headers, rows)}
      disabled={rows.length === 0}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream disabled:opacity-40"
    >
      <Download aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
