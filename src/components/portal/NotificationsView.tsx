"use client";

import { useState, useTransition } from "react";
import { BellRing, Check, Dot } from "lucide-react";

import {
  markAllNotificationsRead,
  setNotificationRead,
} from "@/app/(portal)/portal/actions/notifications";
import { formatPortalDate } from "@/lib/portal/format";
import type { PortalNotification } from "@/types/portal";

type NotificationsViewProps = {
  readonly notifications: readonly PortalNotification[];
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

export function NotificationsView({ notifications }: NotificationsViewProps) {
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(
    () => new Set(notifications.filter((item) => item.read).map((item) => item.id)),
  );
  const [, startTransition] = useTransition();

  function toggle(id: string) {
    const willRead = !readIds.has(id);
    setReadIds((prev) => {
      const next = new Set(prev);

      if (willRead) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
    // Optimistic local update above; persist per-user read state (no-op in mock).
    startTransition(() => {
      void setNotificationRead(id, willRead);
    });
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((item) => item.id)));
    startTransition(() => {
      void markAllNotificationsRead();
    });
  }

  const unread = notifications.filter((item) => !readIds.has(item.id)).length;

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-card">
        <BellRing
          aria-hidden="true"
          className="mx-auto size-8 text-curry-orange"
        />
        <p className="mt-4 font-bold text-charcoal">You are all caught up</p>
        <p className="mt-1 text-sm text-muted-grey">
          There are no notifications to show right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-grey">
          {unread} unread of {notifications.length}
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
        {notifications.map((item) => {
          const isRead = readIds.has(item.id);

          return (
            <li
              key={item.id}
              className={
                isRead
                  ? "rounded-2xl border border-border bg-white p-5 shadow-card"
                  : "rounded-2xl border border-curry-orange/30 bg-soft-cream p-5 shadow-card"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  {!isRead ? (
                    <Dot
                      aria-hidden="true"
                      className="-ml-2 size-6 shrink-0 text-curry-orange"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-grey">
                      {item.body}
                    </p>
                  </div>
                </div>
                {priorityLabel(item.priority)}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-grey">
                  {formatPortalDate(item.createdAt.slice(0, 10))}
                </p>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
                >
                  {isRead ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
