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
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { StudentLifeSlide } from "@/types/content";

type FeatureCarouselVariant = "split" | "media";
type FeatureCarouselMediaSize = "compact" | "large" | "wide";
type SlideDirection = "previous" | "next";
type TransitionPhase = "loading" | "animating";
type ImageLoading = "eager" | "lazy";

type CarouselTransition = {
  fromIndex: number;
  toIndex: number;
  direction: SlideDirection;
  phase: TransitionPhase;
  token: number;
};

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

const transitionDuration = 420;

const mediaSizeClasses: Record<FeatureCarouselMediaSize, string> = {
  compact: "h-[280px] sm:h-[340px]",
  large: "h-[360px] sm:h-[500px] lg:h-[620px]",
  wide: "h-[360px] sm:h-[520px] lg:h-[640px]",
};

function SlideMedia({
  slide,
  mediaSize,
  sizes,
  loading,
  initiallyLoaded,
  onImageLoad,
  onImageError,
}: {
  slide: StudentLifeSlide;
  mediaSize: FeatureCarouselMediaSize;
  sizes: string;
  loading?: ImageLoading;
  initiallyLoaded?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}) {
  return (
    <div
      role={slide.image ? undefined : "img"}
      aria-label={slide.image ? undefined : slide.imageDescription}
      className={cn(
        "pattern-checker relative flex items-center justify-center overflow-hidden rounded-[1.75rem] border border-curry-orange/10 bg-soft-cream",
        mediaSizeClasses[mediaSize],
      )}
    >
      {slide.image ? (
        <ResponsiveImage
          image={slide.image}
          sizes={sizes}
          loading={loading}
          initiallyLoaded={initiallyLoaded}
          onLoad={onImageLoad}
          onError={onImageError}
        />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

function SlideText({ slide }: { slide: StudentLifeSlide }) {
  return (
    <div className="max-w-xl">
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

function SlideComposition({
  slide,
  variant,
  textPosition,
  mediaSize,
  mediaSizes,
  imageLoading,
  imageInitiallyLoaded,
  className,
  ariaHidden,
  onImageLoad,
  onImageError,
}: {
  slide: StudentLifeSlide;
  variant: FeatureCarouselVariant;
  textPosition: "left" | "right";
  mediaSize: FeatureCarouselMediaSize;
  mediaSizes: string;
  imageLoading?: ImageLoading;
  imageInitiallyLoaded?: boolean;
  className?: string;
  ariaHidden?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}) {
  return (
    <div
      className={cn("col-start-1 row-start-1 min-w-0", className)}
      aria-hidden={ariaHidden || undefined}
    >
      {variant === "media" ? (
        <div>
          <SlideMedia
            slide={slide}
            mediaSize={mediaSize}
            sizes={mediaSizes}
            loading={imageLoading}
            initiallyLoaded={imageInitiallyLoaded}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
          />
          <div className="mt-6 rounded-card border border-border bg-white p-6 shadow-card sm:p-7">
            <SlideText slide={slide} />
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
              <SlideText slide={slide} />
              <SlideMedia
                slide={slide}
                mediaSize={mediaSize}
                sizes={mediaSizes}
                loading={imageLoading}
                initiallyLoaded={imageInitiallyLoaded}
                onImageLoad={onImageLoad}
                onImageError={onImageError}
              />
            </>
          ) : (
            <>
              <SlideMedia
                slide={slide}
                mediaSize={mediaSize}
                sizes={mediaSizes}
                loading={imageLoading}
                initiallyLoaded={imageInitiallyLoaded}
                onImageLoad={onImageLoad}
                onImageError={onImageError}
              />
              <SlideText slide={slide} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function animationClass(
  role: "incoming" | "outgoing",
  transition: CarouselTransition,
) {
  if (transition.phase === "loading") {
    return role === "incoming"
      ? "pointer-events-none opacity-0"
      : undefined;
  }

  return `carousel-slide-${role}-${transition.direction}`;
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
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionRef = useRef<CarouselTransition | null>(null);
  const transitionToken = useRef(0);
  const initialResolvedImageIndices = slides.flatMap((slide, index) =>
    slide.image ? [] : [index],
  );
  const resolvedImageIndicesRef = useRef(
    new Set<number>(initialResolvedImageIndices),
  );
  const [resolvedImageIndices, setResolvedImageIndices] = useState<number[]>(
    initialResolvedImageIndices,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<CarouselTransition | null>(null);
  const [preloadIndex, setPreloadIndex] = useState<number | null>(null);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const hasMultipleSlides = slides.length > 1;
  const isTransitioning = transition !== null;
  const visibleIndex =
    transition?.phase === "animating"
      ? transition.toIndex
      : activeIndex;
  const activeSlide = slides[visibleIndex] ?? slides[0];
  const mediaSizes =
    variant === "media"
      ? "(min-width: 1280px) 1200px, 100vw"
      : "(min-width: 1280px) 780px, (min-width: 1024px) 65vw, 100vw";

  const clearTransitionTimers = useCallback(() => {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
  }, []);

  const queueNextSlideImage = useCallback(
    (index: number) => {
      if (!hasMultipleSlides) {
        setPreloadIndex(null);
        return;
      }

      const nextIndex = (index + 1) % slides.length;
      const nextSlide = slides[nextIndex];

      if (
        !nextSlide?.image ||
        resolvedImageIndicesRef.current.has(nextIndex)
      ) {
        setPreloadIndex(null);
        return;
      }

      setPreloadIndex(nextIndex);
    },
    [hasMultipleSlides, slides],
  );

  const finishTransition = useCallback(
    (token: number, toIndex: number) => {
      const current = transitionRef.current;

      if (!current || current.token !== token) {
        return;
      }

      clearTransitionTimers();
      transitionRef.current = null;
      setActiveIndex(toIndex);
      setTransition(null);
      queueNextSlideImage(toIndex);
    },
    [clearTransitionTimers, queueNextSlideImage],
  );

  const beginTransitionAnimation = useCallback(
    (token: number, toIndex: number) => {
      const current = transitionRef.current;

      if (
        !current ||
        current.token !== token ||
        current.phase === "animating"
      ) {
        return;
      }

      if (
        prefersReducedMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        finishTransition(token, toIndex);
        return;
      }

      const animatingTransition = {
        ...current,
        phase: "animating" as const,
      };

      transitionRef.current = animatingTransition;
      setTransition(animatingTransition);
      transitionTimer.current = setTimeout(
        () => finishTransition(token, toIndex),
        transitionDuration,
      );
    },
    [finishTransition, prefersReducedMotion],
  );

  const handleSlideImageResolved = useCallback(
    (index: number) => {
      if (!resolvedImageIndicesRef.current.has(index)) {
        resolvedImageIndicesRef.current.add(index);
        setResolvedImageIndices((current) =>
          current.includes(index) ? current : [...current, index],
        );
      }

      const currentTransition = transitionRef.current;

      if (
        currentTransition?.phase === "loading" &&
        currentTransition.toIndex === index
      ) {
        beginTransitionAnimation(
          currentTransition.token,
          currentTransition.toIndex,
        );
        return;
      }

      if (!currentTransition && index === activeIndex) {
        queueNextSlideImage(index);
      }
    },
    [activeIndex, beginTransitionAnimation, queueNextSlideImage],
  );

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
    (
      nextIndex: number,
      direction: SlideDirection,
      causedByInteraction = true,
    ) => {
      if (!slides.length || transitionRef.current) {
        return;
      }

      const normalizedIndex =
        (nextIndex + slides.length) % slides.length;

      if (normalizedIndex === activeIndex) {
        return;
      }

      if (causedByInteraction) {
        postponeAutomaticAdvance();
      }

      const reduceMotion =
        prefersReducedMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const targetIsReady =
        !slides[normalizedIndex]?.image ||
        resolvedImageIndicesRef.current.has(normalizedIndex);

      if (reduceMotion && targetIsReady) {
        setActiveIndex(normalizedIndex);
        queueNextSlideImage(normalizedIndex);
        return;
      }

      const token = ++transitionToken.current;
      const nextTransition: CarouselTransition = {
        fromIndex: activeIndex,
        toIndex: normalizedIndex,
        direction,
        phase: targetIsReady && !reduceMotion ? "animating" : "loading",
        token,
      };

      transitionRef.current = nextTransition;
      setTransition(nextTransition);

      if (nextTransition.phase === "animating") {
        transitionTimer.current = setTimeout(
          () => finishTransition(token, normalizedIndex),
          transitionDuration,
        );
      }
    },
    [
      activeIndex,
      finishTransition,
      postponeAutomaticAdvance,
      prefersReducedMotion,
      queueNextSlideImage,
      slides,
    ],
  );

  const showPrevious = useCallback(() => {
    goToSlide(activeIndex - 1, "previous");
  }, [activeIndex, goToSlide]);

  const showNext = useCallback(
    (causedByInteraction = true) => {
      goToSlide(activeIndex + 1, "next", causedByInteraction);
    },
    [activeIndex, goToSlide],
  );

  const directionToIndex = useCallback(
    (index: number): SlideDirection => {
      const forwardDistance =
        (index - activeIndex + slides.length) % slides.length;
      const backwardDistance =
        (activeIndex - index + slides.length) % slides.length;

      return forwardDistance <= backwardDistance ? "next" : "previous";
    },
    [activeIndex, slides.length],
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

      clearTransitionTimers();
    },
    [clearTransitionTimers],
  );

  useEffect(() => {
    if (
      !hasMultipleSlides ||
      isInCooldown ||
      prefersReducedMotion ||
      isTransitioning
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
    isTransitioning,
    prefersReducedMotion,
    showNext,
  ]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isTransitioning) {
      return;
    }

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
      data-carousel-transition={transition?.phase ?? "idle"}
      className={cn("relative min-w-0", className)}
      onKeyDown={handleKeyDown}
      onFocusCapture={postponeAutomaticAdvance}
      onPointerDownCapture={postponeAutomaticAdvance}
    >
      {preloadIndex !== null && slides[preloadIndex]?.image ? (
        <div
          className="pointer-events-none absolute size-px overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <ResponsiveImage
            image={slides[preloadIndex].image}
            sizes={mediaSizes}
            loading="eager"
            initiallyLoaded={resolvedImageIndices.includes(preloadIndex)}
            onLoad={() => handleSlideImageResolved(preloadIndex)}
            onError={() => handleSlideImageResolved(preloadIndex)}
          />
        </div>
      ) : null}

      <div
        id={carouselId}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="grid focus-visible:rounded-card"
      >
        {transition ? (
          <>
            <SlideComposition
              key={`${transition.token}-outgoing`}
              slide={slides[transition.fromIndex]}
              variant={variant}
              textPosition={textPosition}
              mediaSize={mediaSize}
              mediaSizes={mediaSizes}
              imageLoading="lazy"
              imageInitiallyLoaded={resolvedImageIndices.includes(
                transition.fromIndex,
              )}
              className={animationClass("outgoing", transition)}
              ariaHidden={transition.phase === "animating"}
              onImageLoad={() =>
                handleSlideImageResolved(transition.fromIndex)
              }
              onImageError={() =>
                handleSlideImageResolved(transition.fromIndex)
              }
            />
            <SlideComposition
              key={`${transition.token}-incoming`}
              slide={slides[transition.toIndex]}
              variant={variant}
              textPosition={textPosition}
              mediaSize={mediaSize}
              mediaSizes={mediaSizes}
              imageLoading="eager"
              imageInitiallyLoaded={resolvedImageIndices.includes(
                transition.toIndex,
              )}
              className={animationClass("incoming", transition)}
              ariaHidden={transition.phase === "loading"}
              onImageLoad={() =>
                handleSlideImageResolved(transition.toIndex)
              }
              onImageError={() =>
                handleSlideImageResolved(transition.toIndex)
              }
            />
          </>
        ) : (
          <SlideComposition
            key={activeSlide.id}
            slide={activeSlide}
            variant={variant}
            textPosition={textPosition}
            mediaSize={mediaSize}
            mediaSizes={mediaSizes}
            imageLoading="lazy"
            imageInitiallyLoaded={resolvedImageIndices.includes(activeIndex)}
            onImageLoad={() => handleSlideImageResolved(activeIndex)}
            onImageError={() => handleSlideImageResolved(activeIndex)}
          />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-muted-grey" aria-live="polite">
          Showing {visibleIndex + 1} of {slides.length}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Show previous slide in ${label}`}
            aria-controls={carouselId}
            disabled={!hasMultipleSlides || isTransitioning}
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
                  index === visibleIndex
                    ? "bg-curry-orange"
                    : "bg-white hover:bg-soft-cream",
                )}
                aria-label={`Show ${slide.title}`}
                aria-current={index === visibleIndex ? "true" : undefined}
                aria-controls={carouselId}
                disabled={isTransitioning}
                onClick={() =>
                  goToSlide(index, directionToIndex(index))
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label={`Show next slide in ${label}`}
            aria-controls={carouselId}
            disabled={!hasMultipleSlides || isTransitioning}
            onClick={() => showNext()}
          >
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
