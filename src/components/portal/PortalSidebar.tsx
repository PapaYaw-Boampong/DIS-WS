"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe,
  LayoutDashboard,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
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
  bell: Bell,
  bus: Bus,
  settings: Settings,
  file: FileText,
  school: School,
  globe: Globe,
};

const COLLAPSE_KEY = "dis-portal-sidebar-collapsed";

function isNavigationItemActive(
  item: PortalNavigationItem,
  pathname: string,
): boolean {
  return (
    item.href === pathname ||
    item.children?.some((child) => isNavigationItemActive(child, pathname)) ||
    false
  );
}

export function PortalSidebar({
  items,
  pathname,
  roleLabel,
  mobileOpen,
  onClose,
}: PortalSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Reading a persisted UI preference needs an effect (no localStorage in SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  }

  // `compact` collapses the desktop rail to icons only; the mobile drawer is
  // always full width, so it renders with compact=false.
  function renderContent(compact: boolean) {
    return (
      <div className="flex h-full flex-col">
        <div
          className={cn(
            "flex min-h-24 items-center gap-4 border-b border-white/10",
            compact ? "justify-center px-2" : "justify-between px-5",
          )}
        >
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
            {compact ? null : (
              <span className="max-w-40 text-sm leading-tight font-extrabold text-white">
                {school.name}
              </span>
            )}
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

        {compact ? null : (
          <div className="px-5 pt-6">
            <p className="text-xs font-bold tracking-[0.16em] text-curry-orange uppercase">
              {roleLabel} Portal
            </p>
            <p className="mt-2 text-sm text-white/55">Mock foundation preview</p>
          </div>
        )}

        <nav
          className={cn(
            "scrollbar-none flex-1 overflow-y-auto pb-6",
            compact ? "mt-4 px-2" : "mt-6 px-3",
          )}
          aria-label="Portal"
        >
          <ul className="space-y-1.5">
            {items.map((item) => {
              const Icon = navigationIcons[item.icon];
              const active = isNavigationItemActive(item, pathname);

              // Collapsed: parent groups become an icon button that expands the
              // rail (so their children become reachable); links stay links.
              if (compact) {
                if (item.href) {
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        title={item.label}
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center justify-center rounded-2xl transition-colors",
                          active
                            ? "bg-curry-orange text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </Link>
                    </li>
                  );
                }
                if (item.children?.length) {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        title={item.label}
                        aria-label={`${item.label} (expand menu)`}
                        className={cn(
                          "flex min-h-12 w-full items-center justify-center rounded-2xl transition-colors",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.label}>
                    <span
                      title={`${item.label} (planned)`}
                      className="flex min-h-12 items-center justify-center rounded-2xl text-white/40"
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  {item.children?.length ? (
                    <details open={active} className="group">
                      <summary
                        className={cn(
                          "flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <ul className="mt-1 space-y-1 pl-8">
                        {item.children.map((child) => {
                          const ChildIcon = navigationIcons[child.icon];
                          const childActive = child.href === pathname;

                          return (
                            <li key={child.label}>
                              {child.href ? (
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  aria-current={childActive ? "page" : undefined}
                                  className={cn(
                                    "flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-colors",
                                    childActive
                                      ? "bg-curry-orange text-white"
                                      : "text-white/60 hover:bg-white/10 hover:text-white",
                                  )}
                                >
                                  <ChildIcon
                                    aria-hidden="true"
                                    className="size-4 shrink-0"
                                  />
                                  {child.label}
                                </Link>
                              ) : (
                                <span
                                  className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-medium text-white/35"
                                  title={`Planned for portal Phase ${child.phase}`}
                                >
                                  <ChildIcon
                                    aria-hidden="true"
                                    className="size-4 shrink-0"
                                  />
                                  <span className="flex-1">{child.label}</span>
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  ) : item.href ? (
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

        <div
          className={cn(
            "space-y-2 border-t border-white/10 p-4",
            compact && "px-2",
          )}
        >
          {/* Desktop-only collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
            title={compact ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden min-h-11 items-center gap-2 rounded-2xl border border-white/15 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:flex",
              compact ? "w-full justify-center px-0" : "w-full justify-center px-4",
            )}
          >
            {compact ? (
              <PanelLeftOpen aria-hidden="true" className="size-5" />
            ) : (
              <>
                <PanelLeftClose aria-hidden="true" className="size-5" />
                Collapse
              </>
            )}
          </button>
          <Link
            href="/"
            title="Return to public website"
            className={cn(
              "flex min-h-11 items-center justify-center rounded-2xl border border-white/15 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white",
              compact ? "px-0" : "gap-2 px-4",
            )}
          >
            {compact ? (
              <Globe aria-hidden="true" className="size-5" />
            ) : (
              "Return to public website"
            )}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen shrink-0 bg-slate-900 transition-[width] duration-200 lg:sticky lg:top-0 lg:block",
          collapsed ? "w-20" : "w-72",
        )}
      >
        {renderContent(collapsed)}
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
            {renderContent(false)}
          </aside>
        </div>
      ) : null}
    </>
  );
}
