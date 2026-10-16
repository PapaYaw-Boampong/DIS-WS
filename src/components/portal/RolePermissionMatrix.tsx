"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Save } from "lucide-react";

import {
  resetCapabilityMatrix,
  saveCapabilityMatrix,
} from "@/app/(portal)/portal/actions/permissions";
import {
  capabilityGroups,
  defaultCapabilityMatrix,
  type CapabilityMatrix,
  type PortalCapability,
} from "@/lib/portal/capabilities";
import { cn } from "@/lib/utils";
import { portalRoles, type PortalRole } from "@/types/portal";

type RolePermissionMatrixProps = {
  readonly matrix: CapabilityMatrix;
  readonly roleLabels: Record<PortalRole, string>;
};

// Learner and family roles see only their own records, so there is nothing to
// grant them here.
const editableRoles = portalRoles.filter(
  (role) => role !== "student" && role !== "parent",
);

export function RolePermissionMatrix({
  matrix,
  roleLabels,
}: RolePermissionMatrixProps) {
  const [draft, setDraft] = useState<Record<string, readonly PortalCapability[]>>(
    () => Object.fromEntries(portalRoles.map((role) => [role, matrix[role]])),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = portalRoles.some((role) => {
    const current = [...(draft[role] ?? [])].sort();
    const saved = [...matrix[role]].sort();
    return current.join("|") !== saved.join("|");
  });

  function toggle(role: PortalRole, capability: PortalCapability) {
    setMessage(null);
    setDraft((prev) => {
      const held = prev[role] ?? [];
      const next = held.includes(capability)
        ? held.filter((item) => item !== capability)
        : [...held, capability];

      return { ...prev, [role]: next };
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveCapabilityMatrix(draft);
      setMessage(result.message);
    });
  }

  function restoreDefaults() {
    setDraft(
      Object.fromEntries(
        portalRoles.map((role) => [role, defaultCapabilityMatrix[role]]),
      ),
    );
    startTransition(async () => {
      const result = await resetCapabilityMatrix();
      setMessage(result.message);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-grey">
          Tick a capability to grant it. Changes apply to the sidebar and to
          every page guard as soon as they are saved.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={restoreDefaults}
            disabled={pending}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Restore defaults
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
          >
            <Save aria-hidden="true" className="size-4" />
            {pending ? "Saving…" : "Save permissions"}
          </button>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 space-y-8">
        {capabilityGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-sm font-bold tracking-[0.12em] text-muted-grey uppercase">
              {group.label}
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse text-left">
                <caption className="sr-only">
                  {group.label} capabilities by role
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4 text-sm font-bold text-charcoal">
                      Capability
                    </th>
                    {editableRoles.map((role) => (
                      <th
                        key={role}
                        scope="col"
                        className="px-3 py-3 text-center text-sm font-bold text-charcoal"
                      >
                        {roleLabels[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.capabilities.map((capability) => (
                    <tr
                      key={capability.id}
                      className="border-b border-border/70"
                    >
                      <th
                        scope="row"
                        className="py-3 pr-4 text-left align-top font-normal"
                      >
                        <span className="block text-sm font-bold text-charcoal">
                          {capability.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-grey">
                          {capability.description}
                        </span>
                      </th>
                      {editableRoles.map((role) => {
                        const granted = (draft[role] ?? []).includes(
                          capability.id,
                        );

                        return (
                          <td key={role} className="px-3 py-3 text-center">
                            <label
                              className={cn(
                                "inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border transition-colors",
                                granted
                                  ? "border-curry-orange bg-soft-cream"
                                  : "border-border bg-white hover:border-curry-orange/40",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={granted}
                                onChange={() => toggle(role, capability.id)}
                                aria-label={`${capability.label} for ${roleLabels[role]}`}
                                className="size-4 accent-[#e07a1f]"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
