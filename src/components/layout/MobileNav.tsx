"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/content";

type MobileNavProps = {
  items: readonly NavItem[];
};

export function MobileNav({ items }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setExpandedItem(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  function closeMenu() {
    setIsOpen(false);
    setExpandedItem(null);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <X aria-hidden="true" className="size-5" />
        ) : (
          <Menu aria-hidden="true" className="size-5" />
        )}
      </button>

      <div
        id="mobile-navigation"
        className={cn(
          "fixed inset-x-0 top-[78px] max-h-[calc(100vh-78px)] overflow-y-auto border-t border-border bg-white shadow-card",
          isOpen ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6"
          aria-label="Mobile navigation"
        >
          <ul className="space-y-1">
            {items.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isExpanded = expandedItem === item.label;

              return (
                <li key={item.label}>
                  <div className="flex items-center gap-2">
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="flex min-h-12 flex-1 items-center rounded-xl px-3 font-semibold text-charcoal hover:bg-soft-cream"
                    >
                      {item.label}
                    </Link>
                    {hasChildren ? (
                      <button
                        type="button"
                        className="flex size-11 items-center justify-center rounded-xl text-charcoal hover:bg-soft-cream"
                        aria-label={`Toggle ${item.label} links`}
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedItem(isExpanded ? null : item.label)
                        }
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-4 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                    ) : null}
                  </div>
                  {hasChildren && isExpanded ? (
                    <ul className="ml-4 border-l border-border py-1 pl-3">
                      {item.children?.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={closeMenu}
                            className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-muted-grey hover:bg-soft-cream hover:text-charcoal"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <Button
            href={routes.admissions}
            className="mt-5 w-full"
            onLinkClick={closeMenu}
          >
            Apply Now
          </Button>
        </nav>
      </div>
    </div>
  );
}
