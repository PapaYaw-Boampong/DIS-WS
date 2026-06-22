"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Bus,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  MessageSquare,
  School,
  Settings,
  UserRound,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

import { school } from "@/data/school";
import { portalRoutes } from "@/lib/portal/routes";
import { cn } from "@/lib/utils";
import type {
  PortalNavigationIcon,
  PortalNavigationItem,
} from "@/types/portal";

type PortalSidebarProps = {
  readonly items: readonly PortalNavigationItem[];
  readonly pathname: string;
  readonly roleLabel: string;
  readonly mobileOpen: boolean;
  readonly onClose: () => void;
};

const navigationIcons: Record<PortalNavigationIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  user: UserRound,
  calendar: CalendarDays,
  book: BookOpen,
  clipboard: ClipboardCheck,
  chart: BarChart3,
  users: Users,
  wallet: WalletCards,
  message: MessageSquare,
  bus: Bus,
  settings: Settings,
  file: FileText,
  school: School,
};

export function PortalSidebar({
  items,
  pathname,
  roleLabel,
  mobileOpen,
  onClose,
}: PortalSidebarProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex min-h-24 items-center justify-between gap-4 border-b border-white/10 px-5">
        <Link
          href={portalRoutes.landing}
          className="flex items-center gap-3"
          aria-label={`${school.name} portal landing`}
          onClick={onClose}
        >
          <Image
            src="/images/brand/dis-logo.png"
            alt=""
            width={45}
            height={39}
            quality={90}
            className="h-10 w-auto"
          />
          <span className="max-w-40 text-sm leading-tight font-extrabold text-white">
            {school.name}
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="flex size-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Close portal navigation"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="px-5 pt-6">
        <p className="text-xs font-bold tracking-[0.16em] text-curry-orange uppercase">
          {roleLabel} Portal
        </p>
        <p className="mt-2 text-sm text-white/55">Mock foundation preview</p>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-6" aria-label="Portal">
        <ul className="space-y-1.5">
          {items.map((item) => {
            const Icon = navigationIcons[item.icon];
            const active = item.href === pathname;

            return (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-colors",
                      active
                        ? "bg-curry-orange text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium text-white/40"
                    title={`Planned for portal Phase ${item.phase}`}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide uppercase">
                      Soon
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Return to public website
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 bg-slate-900 lg:sticky lg:top-0 lg:block">
        {content}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55"
            aria-label="Close portal navigation"
            onClick={onClose}
          />
          <aside className="relative h-full w-[min(19rem,88vw)] bg-slate-900 shadow-2xl">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}
