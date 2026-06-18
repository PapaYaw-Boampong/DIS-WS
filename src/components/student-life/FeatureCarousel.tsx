"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { cn } from "@/lib/utils";
import type { StudentLifeSlide } from "@/types/content";

type FeatureCarouselVariant = "split" | "media";
type FeatureCarouselMediaSize = "compact" | "large" | "wide";

type FeatureCarouselProps = {
  label: string;
  slides: readonly StudentLifeSlide[];
  variant?: FeatureCarouselVariant;
  textPosition?: "left" | "right";
  mediaSize?: FeatureCarouselMediaSize;
  autoPlayInterval?: number;
  interactionCooldown?: number;
  className?: string;
};

const mediaSizeClasses: Record<FeatureCarouselMediaSize, string> = {
  compact: "min-h-[280px] sm:min-h-[340px]",
  large: "min-h-[360px] sm:min-h-[500px] lg:min-h-[620px]",
  wide: "min-h-[360px] sm:min-h-[520px] lg:min-h-[640px]",
};

function SlideMedia({
  slide,
  mediaSize,
  reducedMotion,
}: {
  slide: StudentLifeSlide;
  mediaSize: FeatureCarouselMediaSize;
  reducedMotion: boolean;
}) {
  return (
    <div
      key={slide.id}
      role="img"
      aria-label={slide.imageDescription}
      className={cn(
        "pattern-checker relative flex items-center justify-center overflow-hidden rounded-[1.75rem] border border-curry-orange/10 bg-soft-cream",
        mediaSizeClasses[mediaSize],
        !reducedMotion && "transition-opacity duration-500",
      )}
    >
      <div
        className="absolute -top-20 -right-20 size-72 rounded-full bg-curry-orange/10"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 size-80 rounded-full bg-curry/10"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-4 px-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-white text-curry-orange shadow-card">
          <ContentIcon name={slide.icon} className="size-9" />
        </div>
        <span className="max-w-sm text-sm font-semibold text-charcoal/70">
          {slide.imageLabel}
        </span>
      </div>
    </div>
  );
}

function SlideText({ slide }: { slide: StudentLifeSlide }) {
  return (
    <div key={slide.id} className="max-w-xl">
      {slide.eyebrow ? (
        <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
          {slide.eyebrow}
        </p>
      ) : null}
      <h3 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl lg:text-[2.625rem] lg:leading-[1.15]">
        {slide.title}
      </h3>
      <p className="mt-5 text-lg leading-8 text-muted-grey">
        {slide.description}
      </p>
    </div>
  );
}

export function FeatureCarousel({
  label,
  slides,
  variant = "split",
  textPosition = "left",
  mediaSize = "large",
  autoPlayInterval = 7000,
  interactionCooldown = 14000,
  className,
}: FeatureCarouselProps) {
  const carouselId = useId();
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const activeSlide = slides[activeIndex] ?? slides[0];
  const hasMultipleSlides = slides.length > 1;

  const postponeAutomaticAdvance = useCallback(() => {
    if (!hasMultipleSlides || prefersReducedMotion) {
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
  }, [hasMultipleSlides, interactionCooldown, prefersReducedMotion]);

  const goToSlide = useCallback(
    (nextIndex: number, causedByInteraction = true) => {
      if (!slides.length) {
        return;
      }

      if (causedByInteraction) {
        postponeAutomaticAdvance();
      }

      setActiveIndex((nextIndex + slides.length) % slides.length);
    },
    [postponeAutomaticAdvance, slides.length],
  );

  const showPrevious = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  const showNext = useCallback(
    (causedByInteraction = true) => {
      goToSlide(activeIndex + 1, causedByInteraction);
    },
    [activeIndex, goToSlide],
  );

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
  }, []);

  useEffect(
    () => () => {
      if (cooldownTimer.current) {
        clearTimeout(cooldownTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      !hasMultipleSlides ||
      isInCooldown ||
      prefersReducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(
      () => showNext(false),
      autoPlayInterval,
    );

    return () => window.clearInterval(timer);
  }, [
    autoPlayInterval,
    hasMultipleSlides,
    isInCooldown,
    prefersReducedMotion,
    showNext,
  ]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  if (!activeSlide) {
    return null;
  }

  return (
    <div
      data-feature-carousel={label}
      data-carousel-cooldown={isInCooldown ? "active" : "idle"}
      className={cn("min-w-0", className)}
      onKeyDown={handleKeyDown}
      onFocusCapture={postponeAutomaticAdvance}
      onPointerDownCapture={postponeAutomaticAdvance}
    >
      <div
        id={carouselId}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="focus-visible:rounded-card"
      >
        {variant === "media" ? (
          <div>
            <SlideMedia
              slide={activeSlide}
              mediaSize={mediaSize}
              reducedMotion={prefersReducedMotion}
            />
            <div className="mt-6 rounded-card border border-border bg-white p-6 shadow-card sm:p-7">
              <SlideText slide={activeSlide} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-8 lg:items-center",
              textPosition === "left"
                ? "lg:grid-cols-[0.65fr_1.35fr]"
                : "lg:grid-cols-[1.35fr_0.65fr]",
            )}
          >
            {textPosition === "left" ? (
              <>
                <SlideText slide={activeSlide} />
                <SlideMedia
                  slide={activeSlide}
                  mediaSize={mediaSize}
                  reducedMotion={prefersReducedMotion}
                />
              </>
            ) : (
              <>
                <SlideMedia
                  slide={activeSlide}
                  mediaSize={mediaSize}
                  reducedMotion={prefersReducedMotion}
                />
                <SlideText slide={activeSlide} />
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-muted-grey" aria-live="polite">
          Showing {activeIndex + 1} of {slides.length}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Show previous slide in ${label}`}
            aria-controls={carouselId}
            disabled={!hasMultipleSlides}
            onClick={showPrevious}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={cn(
                  "size-3 rounded-full border border-curry-orange transition-colors",
                  index === activeIndex
                    ? "bg-curry-orange"
                    : "bg-white hover:bg-soft-cream",
                )}
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
                aria-controls={carouselId}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Show next slide in ${label}`}
            aria-controls={carouselId}
            disabled={!hasMultipleSlides}
            onClick={() => showNext()}
          >
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
