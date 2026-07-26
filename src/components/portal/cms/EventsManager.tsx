"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { IconSelect } from "@/components/portal/cms/IconSelect";
import { ImagePicker } from "@/components/portal/cms/ImagePicker";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  type EventInput,
} from "@/app/(portal)/portal/actions/cms";
import type { CmsEventPost } from "@/lib/portal/data/cms";

type EventsManagerProps = {
  readonly events: readonly CmsEventPost[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";
const labelClass = "block text-sm font-bold text-charcoal";

const emptyDraft: EventInput = {
  title: "",
  dateLabel: "",
  description: "",
  icon: "calendar",
  featured: false,
  status: "draft",
  position: 0,
  imageId: null,
  imageObjectKey: null,
  imageAlt: null,
};

export function EventsManager({ events }: EventsManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventInput>(emptyDraft);

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function startEdit(event: CmsEventPost) {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      dateLabel: event.dateLabel,
      description: event.description,
      icon: event.icon,
      featured: event.featured,
      status: event.status,
      position: event.position,
      imageId: event.imageId,
      imageObjectKey: event.imageObjectKey,
      imageAlt: event.imageAlt,
    });
    setMessage(null);
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!draft.title.trim() || !draft.description.trim()) {
      setMessage("Add a title and a description.");
      return;
    }
    startTransition(async () => {
      const result = editingId
        ? await updateEvent(editingId, draft)
        : await createEvent(draft);
      if (!result.ok) {
        setMessage(
          result.error === "backend_required"
            ? "Managing events requires the live backend (USE_REAL_PORTAL_AUTH)."
            : "Could not save the event.",
        );
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteEvent(id);
      if (!result.ok) {
        setMessage("Could not delete the event.");
        return;
      }
      if (editingId === id) resetForm();
      router.refresh();
    });
  }

  function togglePublish(event: CmsEventPost) {
    startTransition(async () => {
      await updateEvent(event.id, {
        status: event.status === "published" ? "draft" : "published",
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
            {editingId ? "Edit event" : "Add event"}
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
            Title
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Date label
            <input
              value={draft.dateLabel}
              onChange={(e) => setDraft({ ...draft, dateLabel: e.target.value })}
              className={fieldClass}
              placeholder="e.g. School activity programme"
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

        <div className="grid gap-5 sm:grid-cols-3">
          <label className={labelClass} htmlFor="event-icon">
            Icon
            <IconSelect
              id="event-icon"
              name="icon"
              value={draft.icon}
              onChange={(icon) => setDraft({ ...draft, icon })}
            />
          </label>
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

        <label className="flex items-center gap-3 text-sm font-bold text-charcoal">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
            className="size-4"
          />
          Feature on the homepage
        </label>

        <div>
          <span className={labelClass}>Image</span>
          <div className="mt-2">
            <ImagePicker
              value={{
                imageId: draft.imageId,
                imageObjectKey: draft.imageObjectKey,
                imageAlt: draft.imageAlt,
              }}
              onChange={(next) => setDraft({ ...draft, ...next })}
            />
          </div>
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
          {pending ? "Saving…" : editingId ? "Save changes" : "Add event"}
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
        {events.length === 0 ? (
          <li className="py-6 text-sm text-muted-grey">
            No events yet. Add one above.
          </li>
        ) : (
          events.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-charcoal">{event.title}</span>
                  <StatusBadge
                    variant={event.status === "published" ? "success" : "neutral"}
                  >
                    {event.status === "published" ? "Live" : "Draft"}
                  </StatusBadge>
                  {event.featured ? (
                    <StatusBadge variant="warning">Homepage</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-muted-grey">
                  {event.dateLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(event)}
                  disabled={pending}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  {event.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(event)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
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
