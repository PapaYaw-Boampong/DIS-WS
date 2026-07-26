"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  createCalendarTerm,
  deleteCalendarTerm,
  updateCalendarTerm,
} from "@/app/(portal)/portal/actions/cms";
import type { CmsCalendarTerm } from "@/lib/portal/data/cms";

type CalendarManagerProps = {
  readonly terms: readonly CmsCalendarTerm[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";
const labelClass = "block text-sm font-bold text-charcoal";

type Draft = {
  name: string;
  period: string;
  description: string;
  highlightsText: string;
  status: "draft" | "published";
  position: number;
};

const emptyDraft: Draft = {
  name: "",
  period: "",
  description: "",
  highlightsText: "",
  status: "draft",
  position: 0,
};

export function CalendarManager({ terms }: CalendarManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function startEdit(term: CmsCalendarTerm) {
    setEditingId(term.id);
    setDraft({
      name: term.name,
      period: term.period,
      description: term.description,
      highlightsText: term.highlights.join("\n"),
      status: term.status,
      position: term.position,
    });
    setMessage(null);
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!draft.name.trim() || !draft.description.trim()) {
      setMessage("Add a name and a description.");
      return;
    }
    const payload = {
      name: draft.name.trim(),
      period: draft.period.trim(),
      description: draft.description.trim(),
      highlights: draft.highlightsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      status: draft.status,
      position: draft.position,
    };
    startTransition(async () => {
      const result = editingId
        ? await updateCalendarTerm(editingId, payload)
        : await createCalendarTerm(payload);
      if (!result.ok) {
        setMessage(
          result.error === "backend_required"
            ? "Managing the calendar requires the live backend (USE_REAL_PORTAL_AUTH)."
            : "Could not save the term.",
        );
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCalendarTerm(id);
      if (!result.ok) {
        setMessage("Could not delete the term.");
        return;
      }
      if (editingId === id) resetForm();
      router.refresh();
    });
  }

  function togglePublish(term: CmsCalendarTerm) {
    startTransition(async () => {
      await updateCalendarTerm(term.id, {
        status: term.status === "published" ? "draft" : "published",
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-soft-white p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-charcoal">
            {editingId ? "Edit term" : "Add term"}
          </h3>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm font-bold text-muted-grey hover:text-charcoal"
            >
              <X aria-hidden="true" className="size-4" />
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Name
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={fieldClass}
              placeholder="e.g. Term One"
            />
          </label>
          <label className={labelClass}>
            Period label
            <input
              value={draft.period}
              onChange={(e) => setDraft({ ...draft, period: e.target.value })}
              className={fieldClass}
              placeholder="e.g. Opening term"
            />
          </label>
        </div>

        <label className={labelClass}>
          Description
          <textarea
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            rows={2}
            className={`${fieldClass} py-3`}
          />
        </label>

        <label className={labelClass}>
          Highlights{" "}
          <span className="font-normal text-muted-grey">— one per line</span>
          <textarea
            value={draft.highlightsText}
            onChange={(e) =>
              setDraft({ ...draft, highlightsText: e.target.value })
            }
            rows={4}
            className={`${fieldClass} py-3`}
            placeholder={"Orientation and learning routines\nBaseline assessment"}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClass}>
            Order
            <input
              type="number"
              value={draft.position}
              onChange={(e) =>
                setDraft({ ...draft, position: Number(e.target.value) || 0 })
              }
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Status
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  status: e.target.value as "draft" | "published",
                })
              }
              className={fieldClass}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          {editingId ? (
            <Save aria-hidden="true" className="size-5" />
          ) : (
            <Plus aria-hidden="true" className="size-5" />
          )}
          {pending ? "Saving…" : editingId ? "Save changes" : "Add term"}
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
        {terms.length === 0 ? (
          <li className="py-6 text-sm text-muted-grey">
            No calendar terms yet. Add one above.
          </li>
        ) : (
          terms.map((term) => (
            <li
              key={term.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-charcoal">{term.name}</span>
                  <StatusBadge
                    variant={term.status === "published" ? "success" : "neutral"}
                  >
                    {term.status === "published" ? "Live" : "Draft"}
                  </StatusBadge>
                </div>
                <p className="mt-1 truncate text-sm text-muted-grey">
                  {term.period} · {term.highlights.length} highlight
                  {term.highlights.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(term)}
                  disabled={pending}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  {term.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(term)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(term.id)}
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
