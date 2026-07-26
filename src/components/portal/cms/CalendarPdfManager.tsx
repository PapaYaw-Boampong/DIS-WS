"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Upload } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  deleteCalendarPdf,
  setCalendarPdfStatus,
  uploadCalendarPdf,
} from "@/app/(portal)/portal/actions/cms";
import type { CmsCalendarDocument } from "@/lib/portal/data/cms";

type CalendarPdfManagerProps = {
  readonly document: CmsCalendarDocument | null;
};

const MAX_PDF_BYTES = 10 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

export function CalendarPdfManager({ document }: CalendarPdfManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleFile(file: File) {
    setMessage(null);
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setMessage("That PDF is larger than 10MB. Please upload a smaller file.");
      return;
    }
    startTransition(async () => {
      const dataBase64 = await readAsBase64(file);
      const result = await uploadCalendarPdf({
        fileName: file.name,
        mimeType: "application/pdf",
        dataBase64,
        status: "published",
      });
      if (!result.ok) {
        setMessage(
          result.error === "backend_required"
            ? "Uploading requires the live backend (USE_REAL_PORTAL_AUTH)."
            : result.error === "file_too_large"
              ? "That PDF is too large."
              : "Could not upload the PDF.",
        );
        return;
      }
      setMessage("Uploaded and published. The calendar page now shows the flipbook.");
      router.refresh();
    });
  }

  function togglePublish() {
    if (!document) return;
    startTransition(async () => {
      await setCalendarPdfStatus(
        document.status === "published" ? "draft" : "published",
      );
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCalendarPdf();
      if (!result.ok) {
        setMessage("Could not remove the PDF.");
        return;
      }
      setMessage("Removed. The calendar page now shows the term structure.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-soft-white p-5">
      <div>
        <h3 className="text-lg font-bold text-charcoal">School calendar PDF</h3>
        <p className="mt-1 text-sm text-muted-grey">
          Upload the official calendar as a PDF. When published, the public
          calendar page shows it as a page-turning flipbook instead of the term
          tabs below.
        </p>
      </div>

      {document ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileText aria-hidden="true" className="size-6 shrink-0 text-curry-orange" />
            <div className="min-w-0">
              <p className="truncate font-bold text-charcoal">{document.fileName}</p>
              <StatusBadge
                variant={document.status === "published" ? "success" : "neutral"}
              >
                {document.status === "published" ? "Live on site" : "Draft"}
              </StatusBadge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePublish}
              disabled={pending}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
            >
              {document.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-grey">
          No calendar PDF uploaded yet — the public page is showing the term
          structure.
        </p>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-5 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Upload aria-hidden="true" className="size-5" />
          {pending
            ? "Uploading…"
            : document
              ? "Replace PDF"
              : "Upload calendar PDF"}
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-white p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
