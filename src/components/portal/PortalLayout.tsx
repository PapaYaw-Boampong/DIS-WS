"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { portalNavigation } from "@/lib/portal/navigation";
import { portalRoleLabels } from "@/lib/portal/roles";
import type {
  MockPortalSession,
  PortalNavigationItem,
  PortalRole,
} from "@/types/portal";

type PortalLayoutProps = {
  readonly children: ReactNode;
  readonly role: PortalRole;
  readonly session: MockPortalSession;
};

function findActiveNavigationItem(
  items: readonly PortalNavigationItem[],
  pathname: string,
): PortalNavigationItem | undefined {
  for (const item of items) {
    if (item.href === pathname) {
      return item;
    }

    if (item.children) {
      const child = findActiveNavigationItem(item.children, pathname);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function PortalLayout({
  children,
  role,
  session,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigation = portalNavigation[role];
  const activeItem = findActiveNavigationItem(navigation, pathname);
  const pageTitle = activeItem?.label ?? "Portal";
  const notificationCount = role === "parent" ? 3 : undefined;

  return (
    <div className="min-h-screen bg-soft-white lg:flex">
      <a
        href="#portal-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-charcoal focus:shadow-card"
      >
        Skip to portal content
      </a>
      <PortalSidebar
        items={navigation}
        pathname={pathname}
        roleLabel={portalRoleLabels[role]}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <PortalTopbar
          pageTitle={pageTitle}
          roleLabel={portalRoleLabels[role]}
          user={session.user}
          notificationCount={notificationCount}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main
          id="portal-main-content"
          tabIndex={-1}
          className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
        >
          <div key={pathname} className="portal-route-enter mx-auto max-w-[1180px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
