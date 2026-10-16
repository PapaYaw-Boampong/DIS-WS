"use client";

import { useState, useTransition } from "react";
import { BellRing, Check, ChevronDown } from "lucide-react";

import {
  markAllNotificationsRead,
  setNotificationRead,
} from "@/app/(portal)/portal/actions/notifications";
import { formatPortalDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import type { PortalNotification } from "@/types/portal";

type AnnouncementsViewProps = {
  readonly announcements: readonly PortalNotification[];
};

function priorityLabel(priority: string) {
  if (priority === "high" || priority === "critical") {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
        High
      </span>
    );
  }

  if (priority === "medium" || priority === "warning") {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
        Medium
      </span>
    );
  }

  return (
    <span className="rounded-full bg-soft-cream px-2.5 py-0.5 text-xs font-bold text-deep-orange">
      Info
    </span>
  );
}

export function AnnouncementsView({ announcements }: AnnouncementsViewProps) {
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(
    () => new Set(announcements.filter((item) => item.read).map((item) => item.id)),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function markRead(id: string) {
    if (readIds.has(id)) {
      return;
    }

    setReadIds((prev) => new Set(prev).add(id));
    // Optimistic local update above; persist per-user read state (no-op in mock).
    startTransition(() => {
      void setNotificationRead(id, true);
    });
  }

  // Opening an announcement is what marks it read — the same gesture a reader
  // already makes, so there is no separate "mark read" step.
  function toggleOpen(id: string) {
    setOpenId((current) => {
      if (current === id) {
        return null;
      }

      markRead(id);
      return id;
    });
  }

  function markAllRead() {
    setReadIds(new Set(announcements.map((item) => item.id)));
    startTransition(() => {
      void markAllNotificationsRead();
    });
  }

  const unread = announcements.filter((item) => !readIds.has(item.id)).length;

  if (announcements.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-card">
        <BellRing
          aria-hidden="true"
          className="mx-auto size-8 text-curry-orange"
        />
        <p className="mt-4 font-bold text-charcoal">You are all caught up</p>
        <p className="mt-1 text-sm text-muted-grey">
          There are no announcements to show right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-grey">
          {unread} unread of {announcements.length}
        </p>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unread === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
        >
          <Check aria-hidden="true" className="size-4" />
          Mark all read
        </button>
      </div>

      <ul className="space-y-3">
        {announcements.map((item) => {
          const isRead = readIds.has(item.id);
          const isOpen = openId === item.id;

          return (
            <li
              key={item.id}
              className={cn(
                "overflow-hidden rounded-2xl border shadow-card transition-colors",
                isRead
                  ? "border-border bg-white"
                  : "border-curry-orange/30 bg-soft-cream",
              )}
            >
              <button
                type="button"
                onClick={() => toggleOpen(item.id)}
                aria-expanded={isOpen}
                aria-controls={`announcement-${item.id}`}
                className="flex w-full items-start gap-3 p-5 text-left"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    isRead ? "bg-transparent" : "bg-curry-orange",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        "text-charcoal",
                        isRead ? "font-semibold" : "font-extrabold",
                      )}
                    >
                      {item.title}
                    </span>
                    {priorityLabel(item.priority)}
                    {isRead ? null : (
                      <span className="text-xs font-bold text-deep-orange">
                        New
                      </span>
                    )}
                  </span>
                  {isOpen ? null : (
                    <span className="mt-1 block truncate text-sm text-muted-grey">
                      {item.body}
                    </span>
                  )}
                  <span className="mt-1 block text-xs font-semibold text-muted-grey">
                    {formatPortalDate(item.createdAt.slice(0, 10))}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 size-5 shrink-0 text-muted-grey transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>

              {isOpen ? (
                <div
                  id={`announcement-${item.id}`}
                  className="border-t border-border/70 px-5 py-4"
                >
                  <p className="text-sm leading-6 text-charcoal">{item.body}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
