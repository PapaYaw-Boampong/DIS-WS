"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function ReportExportPlaceholder() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-charcoal">
          Report type
          <select className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
            <option>Collection Summary</option>
            <option>Outstanding Balances</option>
            <option>Payment Transactions</option>
            <option>Category Performance</option>
          </select>
        </label>
        <label className="text-sm font-bold text-charcoal">
          Format
          <select className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
            <option>CSV</option>
            <option>PDF</option>
            <option>Excel</option>
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={() =>
          setMessage(
            "Report export was previewed. No file was generated or downloaded.",
          )
        }
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
      >
        <Download aria-hidden="true" className="size-5" />
        Preview report export
      </button>
      {message ? (
        <p role="status" className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal">
          {message}
        </p>
      ) : null}
    </div>
  );
}
