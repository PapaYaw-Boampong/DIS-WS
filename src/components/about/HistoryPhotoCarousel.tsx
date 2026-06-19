"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type HistoryPhoto = {
  readonly id: string;
  readonly label: string;
  readonly image: SiteImage;
};

type HistoryPhotoCarouselProps = {
  photos: readonly HistoryPhoto[];
};

export function HistoryPhotoCarousel({
  photos,
}: HistoryPhotoCarouselProps) {
  const carouselId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [requestedIndex, setRequestedIndex] = useState<number | null>(
    null,
  );
  const [mountedIndices, setMountedIndices] = useState<number[]>([0]);
  const [resolvedIndices, setResolvedIndices] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasMultiplePhotos = photos.length > 1;
  const isWaitingForPhoto = requestedIndex !== null;
  const activePhoto = photos[activeIndex] ?? photos[0];

  const mountPhoto = useCallback((index: number) => {
    setMountedIndices((current) =>
      current.includes(index) ? current : [...current, index],
    );
  }, []);

  const resolvePhoto = useCallback(
    (index: number) => {
      setResolvedIndices((current) =>
        current.includes(index) ? current : [...current, index],
      );

      if (requestedIndex === index) {
        setActiveIndex(index);
        setRequestedIndex(null);
        mountPhoto((index + 1) % photos.length);
        return;
      }

      if (activeIndex === index && hasMultiplePhotos) {
        mountPhoto((index + 1) % photos.length);
      }
    },
    [
      activeIndex,
      hasMultiplePhotos,
      mountPhoto,
      photos.length,
      requestedIndex,
    ],
  );

  const showPhoto = useCallback(
    (index: number) => {
      if (!photos.length || requestedIndex !== null) {
        return;
      }

      const normalizedIndex =
        (index + photos.length) % photos.length;

      if (normalizedIndex === activeIndex) {
        return;
      }

      if (resolvedIndices.includes(normalizedIndex)) {
        setActiveIndex(normalizedIndex);
        mountPhoto((normalizedIndex + 1) % photos.length);
        return;
      }

      mountPhoto(normalizedIndex);
      setRequestedIndex(normalizedIndex);
    },
    [
      activeIndex,
      mountPhoto,
      photos.length,
      requestedIndex,
      resolvedIndices,
    ],
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

  useEffect(() => {
    if (
      !hasMultiplePhotos ||
      isPaused ||
      prefersReducedMotion ||
      isWaitingForPhoto
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      showPhoto(activeIndex + 1);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [
    activeIndex,
    hasMultiplePhotos,
    isPaused,
    isWaitingForPhoto,
    photos.length,
    prefersReducedMotion,
    showPhoto,
  ]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isWaitingForPhoto) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(activeIndex + 1);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false);
    }
  }

  if (!activePhoto) {
    return null;
  }

  return (
    <div
      className="mx-auto max-w-5xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <div
        id={carouselId}
        role="region"
        aria-label="Historical school photographs"
        tabIndex={0}
        className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-curry-orange/10 bg-soft-cream shadow-card"
      >
        {photos.map((photo, index) =>
          mountedIndices.includes(index) ? (
            <div
              key={photo.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
                index === activeIndex
                  ? "z-10 opacity-100"
                  : "pointer-events-none opacity-0",
              )}
              aria-hidden={index !== activeIndex || undefined}
            >
              <ResponsiveImage
                image={photo.image}
                sizes="(min-width: 1280px) 1024px, (min-width: 640px) 90vw, 100vw"
                loading={index === 0 ? "lazy" : "eager"}
                initiallyLoaded={resolvedIndices.includes(index)}
                className="object-contain"
                onLoad={() => resolvePhoto(index)}
                onError={() => resolvePhoto(index)}
              />
            </div>
          ) : null,
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className="min-h-6 text-sm font-semibold text-muted-grey"
          aria-live="polite"
        >
          {activePhoto.label}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Show previous historical photograph"
            aria-controls={carouselId}
            disabled={!hasMultiplePhotos || isWaitingForPhoto}
            onClick={() => showPhoto(activeIndex - 1)}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={cn(
                  "size-3 rounded-full border border-curry-orange transition-colors",
                  index === activeIndex
                    ? "bg-curry-orange"
                    : "bg-white hover:bg-soft-cream",
                )}
                aria-label={`Show ${photo.label}`}
                aria-current={index === activeIndex ? "true" : undefined}
                aria-controls={carouselId}
                disabled={isWaitingForPhoto}
                onClick={() => showPhoto(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Show next historical photograph"
            aria-controls={carouselId}
            disabled={!hasMultiplePhotos || isWaitingForPhoto}
            onClick={() => showPhoto(activeIndex + 1)}
          >
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
