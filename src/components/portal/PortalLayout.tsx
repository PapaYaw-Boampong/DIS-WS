"use client";

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { portalRoleLabels } from "@/lib/portal/roles";
import { cn } from "@/lib/utils";
import type {
  MockPortalSession,
  PortalNavigationItem,
  PortalNotification,
  PortalRole,
} from "@/types/portal";

type PortalLayoutProps = {
  readonly children: ReactNode;
  readonly role: PortalRole;
  readonly session: MockPortalSession;
  readonly notifications: readonly PortalNotification[];
  // Already filtered to the capabilities this role holds.
  readonly navigation: readonly PortalNavigationItem[];
  readonly preview: boolean;
};

// A single course workspace carries its own nav column plus module, assignment
// and grade content, so it runs wider and tighter than the dashboard pages.
const courseWorkspacePattern = /^\/portal\/[^/]+\/courses\/[^/]+/;

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
  notifications,
  navigation,
  preview,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = findActiveNavigationItem(navigation, pathname);
  const pageTitle = activeItem?.label ?? "Portal";
  const wideWorkspace = courseWorkspacePattern.test(pathname);

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
        preview={preview}
        onClose={() => setMobileOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <PortalTopbar
          pageTitle={pageTitle}
          roleLabel={portalRoleLabels[role]}
          user={session.user}
          role={role}
          notifications={notifications}
          onMenuOpen={() => setMobileOpen(true)}
        />
        <main
          id="portal-main-content"
          tabIndex={-1}
          className={cn(
            "px-4 sm:px-6 lg:px-8",
            wideWorkspace ? "py-4 lg:py-5" : "py-8 lg:py-10",
          )}
        >
          <div
            key={pathname}
            className={cn(
              "portal-route-enter mx-auto",
              wideWorkspace ? "max-w-[1700px]" : "max-w-[1180px]",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
