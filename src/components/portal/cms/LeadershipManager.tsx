"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Pencil, Plus, Save, X } from "lucide-react";

import { IconSelect } from "@/components/portal/cms/IconSelect";
import { ImagePicker } from "@/components/portal/cms/ImagePicker";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  updateLeaderProfile,
  type LeaderProfileInput,
} from "@/app/(portal)/portal/actions/cms";
import type { CmsLeader } from "@/lib/portal/data/cms";

type LeadershipManagerProps = {
  readonly staff: readonly CmsLeader[];
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";
const labelClass = "block text-sm font-bold text-charcoal";

function toDraft(leader: CmsLeader): LeaderProfileInput {
  return {
    showOnWebsite: leader.showOnWebsite,
    websitePosition: leader.websitePosition,
    publicTitle: leader.publicTitle || leader.title,
    publicRole: leader.publicRole,
    publicBio: leader.publicBio,
    publicIcon: leader.publicIcon,
    imageId: leader.imageId,
    imageObjectKey: leader.imageObjectKey,
    imageAlt: leader.imageAlt,
  };
}

export function LeadershipManager({ staff }: LeadershipManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsLeader | null>(null);
  const [draft, setDraft] = useState<LeaderProfileInput | null>(null);

  const onSite = staff.filter((leader) => leader.showOnWebsite);
  const others = staff.filter((leader) => !leader.showOnWebsite);

  function startEdit(leader: CmsLeader, showOnWebsite = leader.showOnWebsite) {
    setEditing(leader);
    setDraft({
      ...toDraft(leader),
      showOnWebsite,
      // A newly added leader goes to the end of the current list.
      websitePosition: leader.showOnWebsite
        ? leader.websitePosition
        : onSite.length + 1,
    });
    setMessage(null);
  }

  function resetForm() {
    setEditing(null);
    setDraft(null);
  }

  function saveError(error: string | undefined): string {
    return error === "backend_required"
      ? "Managing leadership requires the live backend (USE_REAL_PORTAL_AUTH)."
      : "Could not save the profile.";
  }

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!editing || !draft) return;
    if (!draft.publicTitle.trim() || !draft.publicBio.trim()) {
      setMessage("Add a title and a short description.");
      return;
    }
    startTransition(async () => {
      const result = await updateLeaderProfile(editing.id, draft);
      if (!result.ok) {
        setMessage(saveError(result.error));
        return;
      }
      resetForm();
      router.refresh();
    });
  }

  function removeFromSite(leader: CmsLeader) {
    startTransition(async () => {
      const result = await updateLeaderProfile(leader.id, {
        showOnWebsite: false,
      });
      if (!result.ok) {
        setMessage(saveError(result.error));
        return;
      }
      if (editing?.id === leader.id) resetForm();
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {editing && draft ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-soft-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-charcoal">
                {editing.fullName}
              </h3>
              <p className="mt-1 text-sm text-muted-grey">
                {editing.staffId} · Name and status are managed by the registry.
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-sm font-bold text-muted-grey hover:text-charcoal"
            >
              <X aria-hidden="true" className="size-4" />
              Cancel
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Title on the website
              <input
                value={draft.publicTitle}
                onChange={(e) =>
                  setDraft({ ...draft, publicTitle: e.target.value })
                }
                className={fieldClass}
                placeholder="e.g. Principal / Headmaster"
              />
            </label>
            <label className={labelClass}>
              Area of responsibility
              <input
                value={draft.publicRole}
                onChange={(e) =>
                  setDraft({ ...draft, publicRole: e.target.value })
                }
                className={fieldClass}
                placeholder="e.g. Basic & Junior High"
              />
            </label>
          </div>

          <label className={labelClass}>
            Short description
            <textarea
              value={draft.publicBio}
              onChange={(e) => setDraft({ ...draft, publicBio: e.target.value })}
              rows={3}
              className={`${fieldClass} py-3`}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className={labelClass} htmlFor="leader-icon">
              Icon (shown without a photo)
              <IconSelect
                id="leader-icon"
                name="publicIcon"
                value={draft.publicIcon}
                onChange={(publicIcon) => setDraft({ ...draft, publicIcon })}
              />
            </label>
            <label className={labelClass}>
              Order
              <input
                type="number"
                value={draft.websitePosition}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    websitePosition: Number(e.target.value) || 0,
                  })
                }
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Visibility
              <select
                value={draft.showOnWebsite ? "shown" : "hidden"}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    showOnWebsite: e.target.value === "shown",
                  })
                }
                className={fieldClass}
              >
                <option value="hidden">Hidden</option>
                <option value="shown">On the website</option>
              </select>
            </label>
          </div>

          <div>
            <span className={labelClass}>Portrait</span>
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
            <Save aria-hidden="true" className="size-5" />
            {pending ? "Saving…" : "Save profile"}
          </button>
        </form>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-white p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}

      <section>
        <h3 className="text-base font-bold text-charcoal">On the website</h3>
        <ul className="mt-2 divide-y divide-border">
          {onSite.length === 0 ? (
            <li className="py-6 text-sm text-muted-grey">
              Nobody is on the website yet, so the Leadership page still shows
              the built-in profiles. Add a staff member below to take over.
            </li>
          ) : (
            onSite.map((leader) => (
              <li
                key={leader.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-charcoal">
                      {leader.fullName}
                    </span>
                    {leader.status === "active" ? (
                      <StatusBadge variant="success">Live</StatusBadge>
                    ) : (
                      // Inactive staff are filtered out of the public read.
                      <StatusBadge variant="warning">
                        {`Hidden: ${leader.status}`}
                      </StatusBadge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-grey">
                    {leader.websitePosition}. {leader.publicTitle || leader.title}
                    {leader.publicRole ? ` · ${leader.publicRole}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(leader)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange"
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromSite(leader)}
                    disabled={pending}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                  >
                    <EyeOff aria-hidden="true" className="size-3.5" />
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h3 className="text-base font-bold text-charcoal">Other staff</h3>
        <p className="mt-1 text-sm text-muted-grey">
          Someone missing? Staff records are created by the registry; once
          added they appear here.
        </p>
        <ul className="mt-2 divide-y divide-border">
          {others.length === 0 ? (
            <li className="py-6 text-sm text-muted-grey">
              No other staff records.
            </li>
          ) : (
            others.map((leader) => (
              <li
                key={leader.id}
                className="flex flex-wrap items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-charcoal">
                    {leader.fullName}
                  </span>
                  <p className="truncate text-sm text-muted-grey">
                    {leader.staffId} · {leader.title}
                    {leader.department ? ` · ${leader.department}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(leader, true)}
                  disabled={leader.status !== "active"}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  <Plus aria-hidden="true" className="size-3.5" />
                  Add to website
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
