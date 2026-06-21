"use client";

import {
  Children,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CardCarouselProps = {
  label: string;
  children: ReactNode;
  desktopVisible?: 3 | 4;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  interactionCooldown?: number;
  className?: string;
};

export function CardCarousel({
  label,
  children,
  desktopVisible = 3,
  autoPlay = true,
  autoPlayInterval = 8000,
  interactionCooldown = 15000,
  className,
}: CardCarouselProps) {
  const items = Children.toArray(children);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportId = useId();
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentItem, setCurrentItem] = useState(1);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const maximumScroll = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth,
    );
    const firstSlide = viewport.firstElementChild as HTMLElement | null;
    const styles = window.getComputedStyle(viewport);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    const step = firstSlide ? firstSlide.offsetWidth + gap : viewport.clientWidth;

    setCanScrollPrevious(viewport.scrollLeft > 2);
    setCanScrollNext(viewport.scrollLeft < maximumScroll - 2);
    setCurrentItem(
      Math.min(
        items.length,
        Math.max(1, Math.round(viewport.scrollLeft / Math.max(step, 1)) + 1),
      ),
    );
  }, [items.length]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(viewport);
    updateScrollState();

    return () => resizeObserver.disconnect();
  }, [updateScrollState]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function updateMotionPreference() {
      setPrefersReducedMotion(mediaQuery.matches);
    }

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, [autoPlay]);

  useEffect(
    () => () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    },
    [],
  );

  const scroll = useCallback((direction: "previous" | "next") => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const firstSlide = viewport.firstElementChild as HTMLElement | null;
    const styles = window.getComputedStyle(viewport);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    const distance = firstSlide
      ? firstSlide.offsetWidth + gap
      : viewport.clientWidth;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    viewport.scrollBy({
      left: direction === "previous" ? -distance : distance,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  const advanceAutomatically = useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport || document.hidden) {
      return;
    }

    const maximumScroll = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth,
    );

    if (maximumScroll <= 2) {
      return;
    }

    const firstSlide = viewport.firstElementChild as HTMLElement | null;
    const styles = window.getComputedStyle(viewport);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    const distance = firstSlide
      ? firstSlide.offsetWidth + gap
      : viewport.clientWidth;
    const isAtEnd = viewport.scrollLeft >= maximumScroll - 2;

    viewport.scrollTo({
      left: isAtEnd
        ? 0
        : Math.min(viewport.scrollLeft + distance, maximumScroll),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (
      !autoPlay ||
      isInCooldown ||
      prefersReducedMotion ||
      items.length < 2
    ) {
      return;
    }

    const timer = window.setInterval(
      advanceAutomatically,
      autoPlayInterval,
    );

    return () => window.clearInterval(timer);
  }, [
    advanceAutomatically,
    autoPlay,
    autoPlayInterval,
    isInCooldown,
    items.length,
    prefersReducedMotion,
  ]);

  function postponeAutomaticAdvance() {
    if (!autoPlay || prefersReducedMotion) {
      return;
    }

    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current);
    }

    setIsInCooldown(true);
    cooldownTimer.current = setTimeout(() => {
      setIsInCooldown(false);
      cooldownTimer.current = null;
    }, interactionCooldown);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" && canScrollPrevious) {
      event.preventDefault();
      postponeAutomaticAdvance();
      scroll("previous");
    }

    if (event.key === "ArrowRight" && canScrollNext) {
      event.preventDefault();
      postponeAutomaticAdvance();
      scroll("next");
    }
  }

  const desktopBasis =
    desktopVisible === 4
      ? "lg:basis-[calc((100%_-_4.5rem)/4)]"
      : "lg:basis-[calc((100%_-_3rem)/3)]";

  return (
    <div
      className={cn("min-w-0", className)}
      data-carousel-cooldown={isInCooldown ? "active" : "idle"}
      onFocusCapture={postponeAutomaticAdvance}
      onPointerDownCapture={postponeAutomaticAdvance}
    >
      <div className="mb-5 flex items-center justify-end gap-3">
        <p className="sr-only" aria-live="polite">
          Item {currentItem} of {items.length}
        </p>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Show previous items in ${label}`}
          aria-controls={viewportId}
          disabled={!canScrollPrevious}
          onClick={() => scroll("previous")}
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Show next items in ${label}`}
          aria-controls={viewportId}
          disabled={!canScrollNext}
          onClick={() => scroll("next")}
        >
          <ArrowRight aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div
        ref={viewportRef}
        id={viewportId}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={updateScrollState}
        className="scrollbar-none flex touch-pan-x snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-3 focus-visible:rounded-card motion-reduce:scroll-auto"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "min-w-0 shrink-0 snap-start basis-3/4 sm:basis-[calc((75%_-_1.125rem)/2)]",
              desktopBasis,
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
