"use client";

import { Bell, LogOut, Menu } from "lucide-react";

import { logoutMockPortalSession } from "@/app/(portal)/portal/actions";
import type { PortalUser } from "@/types/portal";

type PortalTopbarProps = {
  readonly pageTitle: string;
  readonly roleLabel: string;
  readonly user: PortalUser;
  readonly onMenuOpen: () => void;
};

export function PortalTopbar({
  pageTitle,
  roleLabel,
  user,
  onMenuOpen,
}: PortalTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border text-charcoal lg:hidden"
            aria-label="Open portal navigation"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
              {roleLabel} Portal
            </p>
            <p className="truncate text-lg font-extrabold text-charcoal sm:text-xl">
              {pageTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            disabled
            className="hidden min-h-11 items-center gap-2 rounded-full border border-border bg-soft-cream px-4 text-sm font-semibold text-deep-orange opacity-70 sm:inline-flex"
            title="Notifications are planned for a later phase"
          >
            <Bell aria-hidden="true" className="size-4" />
            Notifications
          </button>

          <div
            className="flex size-11 items-center justify-center rounded-full bg-curry-orange font-extrabold text-white"
            aria-label={`Signed in as ${user.name}`}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>

          <form action={logoutMockPortalSession}>
            <button
              type="submit"
              className="flex size-11 items-center justify-center rounded-2xl border border-border text-muted-grey transition-colors hover:border-curry-orange/40 hover:text-deep-orange"
              aria-label="Sign out of mock portal"
              title="Sign out"
            >
              <LogOut aria-hidden="true" className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
