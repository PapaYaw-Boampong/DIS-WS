"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { formatPortalDate } from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";
import type { PortalNotification, PortalRole } from "@/types/portal";

type NotificationBellProps = {
  readonly role: PortalRole;
  readonly notifications: readonly PortalNotification[];
};

export function NotificationBell({ role, notifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((item) => !item.read).length;
  const recent = notifications.slice(0, 4);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `${unread} unread notifications` : "Notifications"
        }
        className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-soft-cream px-3 text-sm font-semibold text-deep-orange transition-colors hover:bg-white sm:px-4"
      >
        <Bell aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Notifications</span>
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-curry-orange px-1.5 text-[0.65rem] font-extrabold text-white ring-2 ring-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-white p-3 shadow-card"
        >
          <p className="px-2 py-1 text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
            Notifications
          </p>
          {recent.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {recent.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.read
                      ? "rounded-xl px-2 py-2"
                      : "rounded-xl bg-soft-cream px-2 py-2"
                  }
                >
                  <p className="text-sm font-bold text-charcoal">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-grey">
                    {item.body}
                  </p>
                  <p className="mt-1 text-[0.7rem] font-semibold text-muted-grey">
                    {formatPortalDate(item.createdAt.slice(0, 10))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-4 text-sm text-muted-grey">
              No notifications yet.
            </p>
          )}
          <Link
            href={portalRoutes.notifications(role)}
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-curry-orange px-3 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-deep-orange"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
