"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Trash2, Upload } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  deleteDocument,
  updateDocument,
  uploadDocument,
} from "@/app/(portal)/portal/actions/documents";
import type { PortalDocument, PortalRole } from "@/types/portal";

type DocumentsManagerProps = {
  readonly documents: readonly PortalDocument[];
  readonly role: PortalRole;
};

const AUDIENCES = ["all", "parent", "staff", "student"] as const;
const CATEGORIES = [
  "bill",
  "receipt",
  "payment_plan",
  "package",
  "menu",
  "calendar",
  "announcement",
  "policy",
] as const;

const MAX_DOC_BYTES = 15 * 1024 * 1024;
const fieldClass =
  "mt-2 min-h-11 w-full rounded-2xl border border-border bg-white px-4 font-normal";
const labelClass = "block text-sm font-bold text-charcoal";

const audienceLabel: Record<string, string> = {
  all: "Everyone",
  parent: "Parents",
  staff: "Staff",
  student: "Students",
};

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

export function DocumentsManager({ documents, role }: DocumentsManagerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("policy");
  const [audience, setAudience] =
    useState<(typeof AUDIENCES)[number]>("all");
  const [downloadable, setDownloadable] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setCategory("policy");
    setAudience("all");
    setDownloadable(true);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (!title.trim()) {
      setMessage("Add a title.");
      return;
    }
    if (!file) {
      setMessage("Choose a file to upload.");
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      setMessage("That file is larger than 15MB.");
      return;
    }
    startTransition(async () => {
      const dataBase64 = await readAsBase64(file);
      const result = await uploadDocument({
        title: title.trim(),
        description: description.trim(),
        category,
        audience,
        downloadable,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64,
      });
      if (!result.ok) {
        setMessage(
          result.error === "backend_required"
            ? "Uploading documents requires the live backend."
            : result.error === "file_too_large"
              ? "That file is too large."
              : "Could not upload the document.",
        );
        return;
      }
      reset();
      router.refresh();
    });
  }

  function toggleDownloadable(doc: PortalDocument) {
    startTransition(async () => {
      await updateDocument(doc.id, { downloadable: !doc.downloadable });
      router.refresh();
    });
  }

  function changeAudience(doc: PortalDocument, next: string) {
    startTransition(async () => {
      await updateDocument(doc.id, {
        audience: next as (typeof AUDIENCES)[number],
      });
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDocument(id);
      if (!result.ok) {
        setMessage("Could not delete the document.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleUpload}
        className="space-y-5 rounded-2xl border border-border bg-soft-white p-5"
      >
        <h3 className="text-lg font-bold text-charcoal">Upload a document</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Term 1 Feeding Menu"
            />
          </label>
          <label className={labelClass}>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${fieldClass} py-3`}
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Who can see it
            <select
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value as (typeof AUDIENCES)[number])
              }
              className={fieldClass}
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {audienceLabel[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-3 pb-1 text-sm font-bold text-charcoal">
            <input
              type="checkbox"
              checked={downloadable}
              onChange={(e) => setDownloadable(e.target.checked)}
              className="size-4"
            />
            Allow download
          </label>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*,.doc,.docx"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-curry-orange px-5 font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            <FileText aria-hidden="true" className="size-5" />
            {file ? "Change file" : "Choose file"}
          </button>
          {file ? (
            <span className="truncate text-sm text-muted-grey">{file.name}</span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Upload aria-hidden="true" className="size-5" />
          {pending ? "Uploading…" : "Upload document"}
        </button>

        {message ? (
          <p
            role="status"
            className="rounded-2xl border border-curry-orange/25 bg-white p-4 text-sm font-semibold text-charcoal"
          >
            {message}
          </p>
        ) : null}
      </form>

      <ul className="divide-y divide-border">
        {documents.length === 0 ? (
          <li className="py-6 text-sm text-muted-grey">
            No documents yet. Upload one above.
          </li>
        ) : (
          documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <FileText
                    aria-hidden="true"
                    className="size-4 shrink-0 text-curry-orange"
                  />
                  <span className="font-bold text-charcoal">{doc.title}</span>
                  <StatusBadge
                    variant={doc.downloadable ? "success" : "neutral"}
                  >
                    {doc.downloadable ? "Downloadable" : "View only"}
                  </StatusBadge>
                </div>
                <p className="mt-1 truncate text-sm text-muted-grey">
                  {doc.category} · {doc.fileName ?? "external"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={doc.audience}
                  onChange={(e) => changeAudience(doc, e.target.value)}
                  disabled={pending}
                  aria-label="Audience"
                  className="min-h-9 rounded-full border border-border bg-white px-3 text-xs font-bold text-charcoal"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {audienceLabel[a]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => toggleDownloadable(doc)}
                  disabled={pending}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  {doc.downloadable ? "Make view-only" : "Allow download"}
                </button>
                <a
                  href={`/portal/${role}/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange"
                >
                  <Download aria-hidden="true" className="size-3.5" />
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={pending}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
