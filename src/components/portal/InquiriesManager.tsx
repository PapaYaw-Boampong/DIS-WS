"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Save } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import { updateInquiry } from "@/app/(portal)/portal/actions/forms";
import type { Inquiry } from "@/lib/portal/data/forms";

type InquiriesManagerProps = {
  readonly inquiries: readonly Inquiry[];
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
] as const;

const statusVariant = {
  new: "warning",
  in_progress: "info",
  resolved: "success",
} as const;

export function InquiriesManager({ inquiries }: InquiriesManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | Inquiry["status"]>("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const shown =
    filter === "all"
      ? inquiries
      : inquiries.filter((inq) => inq.status === filter);

  function setStatus(inq: Inquiry, status: Inquiry["status"]) {
    startTransition(async () => {
      await updateInquiry(inq.id, { status });
      router.refresh();
    });
  }

  function saveNotes(inq: Inquiry) {
    const notes = notesDraft[inq.id] ?? inq.notes;
    startTransition(async () => {
      await updateInquiry(inq.id, { notes });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "in_progress", "resolved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              filter === f
                ? "bg-curry-orange text-white"
                : "border border-border text-charcoal hover:border-curry-orange"
            }`}
          >
            {f === "all"
              ? "All"
              : f === "in_progress"
                ? "In progress"
                : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {shown.length === 0 ? (
          <li className="rounded-2xl border border-border bg-soft-white p-6 text-sm text-muted-grey">
            No inquiries{filter === "all" ? " yet" : ` marked "${filter}"`}.
          </li>
        ) : (
          shown.map((inq) => (
            <li
              key={inq.id}
              className="rounded-2xl border border-border bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-charcoal">{inq.name}</span>
                    <StatusBadge variant={statusVariant[inq.status]}>
                      {inq.status.replace("_", " ")}
                    </StatusBadge>
                    <StatusBadge variant="neutral">{inq.type}</StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-grey">
                    {inq.subject || "(no subject)"} · {inq.createdAt.slice(0, 10)}
                  </p>
                </div>
                <a
                  href={`mailto:${inq.email}?subject=${encodeURIComponent("Re: " + (inq.subject || "Your enquiry"))}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-curry-orange px-4 py-2 text-xs font-bold text-deep-orange transition-colors hover:bg-soft-cream"
                >
                  <Mail aria-hidden="true" className="size-3.5" />
                  Reply
                </a>
              </div>

              <p className="mt-3 rounded-2xl bg-soft-white p-4 text-sm leading-6 text-charcoal">
                {inq.message}
              </p>
              <p className="mt-2 text-xs font-semibold text-muted-grey">
                {inq.email}
                {inq.phone ? ` · ${inq.phone}` : ""}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(inq, opt.value)}
                    disabled={pending || inq.status === opt.value}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                      inq.status === opt.value
                        ? "bg-charcoal text-white"
                        : "border border-border text-charcoal hover:border-curry-orange"
                    } disabled:opacity-60`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-charcoal">
                  Internal notes
                  <textarea
                    defaultValue={inq.notes}
                    onChange={(e) =>
                      setNotesDraft((prev) => ({
                        ...prev,
                        [inq.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-2 font-normal"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => saveNotes(inq)}
                  disabled={pending}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  <Save aria-hidden="true" className="size-3.5" />
                  Save notes
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
