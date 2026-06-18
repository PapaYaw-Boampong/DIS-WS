"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { MobileNav } from "@/components/layout/MobileNav";
import { TopUtilityBar } from "@/components/layout/TopUtilityBar";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { mainNavigation } from "@/data/navigation";
import { school } from "@/data/school";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <TopUtilityBar />
      <div className="border-b border-border bg-white shadow-header">
        <Container className="flex h-[78px] items-center justify-between gap-6 lg:h-[98px]">
          <Link
            href={routes.home}
            className="flex shrink-0 items-center gap-3"
            aria-label={`${school.name} home`}
          >
            <Image
              src="/images/brand/dis-logo.png"
              alt=""
              width={67}
              height={57}
              priority
              className="h-12 w-auto lg:h-[57px]"
            />
            <span className="max-w-[190px] text-lg leading-tight font-semibold text-charcoal lg:text-xl">
              {school.name}
            </span>
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center lg:flex"
            aria-label="Primary navigation"
          >
            <ul className="flex items-center gap-1 xl:gap-2">
              {mainNavigation.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isOpen = openDropdown === item.label;

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() =>
                      hasChildren && setOpenDropdown(item.label)
                    }
                    onMouseLeave={() =>
                      hasChildren && setOpenDropdown(null)
                    }
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setOpenDropdown(null);
                      }
                    }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-charcoal transition-colors hover:bg-soft-cream hover:text-deep-orange xl:px-4"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenDropdown(isOpen ? null : item.label)
                        }
                      >
                        {item.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-3.5 transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-charcoal transition-colors hover:bg-soft-cream hover:text-deep-orange xl:px-4"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    )}

                    {hasChildren && isOpen ? (
                      <div className="absolute top-full left-0 w-64 pt-2">
                        <ul className="rounded-2xl border border-border bg-white p-2 shadow-card">
                          {item.children?.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                className="block rounded-xl px-4 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-soft-cream hover:text-deep-orange"
                                onClick={() => setOpenDropdown(null)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden shrink-0 xl:block">
            <Button href={routes.admissions}>Apply Now</Button>
          </div>
          <MobileNav items={mainNavigation} />
        </Container>
      </div>
    </header>
  );
}
