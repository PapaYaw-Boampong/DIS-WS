"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";

import { importStatement } from "@/app/(portal)/portal/actions/statements";

export function StatementUploadForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose a CSV file to upload.");
      return;
    }

    startTransition(async () => {
      const result = await importStatement(formData);

      if (!result.ok) {
        setMessage("Could not import this file. Check the CSV and try again.");
        return;
      }

      if (result.mode === "real" && result.import) {
        setMessage(
          `Imported ${result.import.rowCount} row(s) — ${result.import.matchedCount} auto-matched and verified.`,
        );
        form.reset();
        router.refresh();
      } else {
        setMessage(
          "Statement import is a live backend feature and has nothing to preview in mock mode.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-charcoal">
          Statement type
          <select
            name="method"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            <option value="momo">MoMo statement</option>
            <option value="bank">Bank statement</option>
          </select>
        </label>
        <label className="text-sm font-bold text-charcoal">
          CSV file
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            className="mt-2 block w-full rounded-2xl border border-dashed border-border bg-soft-white p-3 text-sm font-normal text-muted-grey file:mr-4 file:rounded-full file:border-0 file:bg-curry-orange file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
      >
        <UploadCloud aria-hidden="true" className="size-5" />
        {pending ? "Importing…" : "Import statement"}
      </button>
      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
