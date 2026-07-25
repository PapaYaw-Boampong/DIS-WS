"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { MobileNav } from "@/components/layout/MobileNav";
import { TopUtilityBar } from "@/components/layout/TopUtilityBar";
import { Button } from "@/components/ui/Button";
import { mainNavigation } from "@/data/navigation";
import { school } from "@/data/school";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // `atTop` drives the transparent-over-hero state; `hidden` drives auto-hide.
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;

    function update() {
      frame = 0;
      const y = window.scrollY;
      setAtTop(y <= 8);

      if (y < 96) {
        setHidden(false);
      } else if (y - lastY > 4) {
        // Scrolling down past the header: slide it away.
        setHidden(true);
        setOpenDropdown(null);
      } else if (lastY - y > 4) {
        setHidden(false);
      }

      lastY = y;
    }

    function onScroll() {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const overlay = atTop;

  const navTriggerClass = cn(
    "inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold transition-colors xl:px-4",
    overlay
      ? "text-white hover:bg-white/15 hover:text-white"
      : "text-charcoal hover:bg-soft-cream hover:text-deep-orange",
  );

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-transform duration-300 motion-reduce:transition-none",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <TopUtilityBar />
      <div
        className={cn(
          "transition-colors duration-300",
          overlay
            ? "bg-transparent"
            : "border-b border-border bg-white shadow-header",
        )}
      >
        <div className="flex h-[78px] w-full items-center justify-between gap-6 px-4 sm:px-6 lg:h-[98px] lg:px-8 2xl:px-12">
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
              quality={90}
              className={cn(
                "h-12 w-auto transition-[filter] duration-300 lg:h-[57px]",
                overlay && "brightness-0 invert",
              )}
            />
            <span
              className={cn(
                "max-w-[190px] text-lg leading-tight font-semibold transition-colors lg:text-xl",
                overlay ? "text-white" : "text-charcoal",
              )}
            >
              {school.name}
            </span>
          </Link>

          <nav
            className="ml-auto hidden items-center lg:flex"
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
                        className={navTriggerClass}
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
                        className={navTriggerClass}
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
          <MobileNav items={mainNavigation} overlay={overlay} />
        </div>
      </div>
    </header>
  );
}
