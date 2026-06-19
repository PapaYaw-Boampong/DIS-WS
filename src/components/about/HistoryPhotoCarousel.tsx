"use client";

import Image from "next/image";
import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useState,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const hasMultiplePhotos = photos.length > 1;
  const activePhoto = photos[activeIndex] ?? photos[0];

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
      prefersReducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [
    hasMultiplePhotos,
    isPaused,
    photos.length,
    prefersReducedMotion,
  ]);

  function showPhoto(index: number) {
    setActiveIndex((index + photos.length) % photos.length);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
        {photos.map((photo, index) => (
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
            <Image
              src={photo.image.src}
              alt={photo.image.alt}
              fill
              sizes="(min-width: 1280px) 1024px, (min-width: 640px) 90vw, 100vw"
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              placeholder="blur"
              className="object-contain"
              style={{ objectPosition: photo.image.position }}
            />
          </div>
        ))}
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
            disabled={!hasMultiplePhotos}
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
                onClick={() => showPhoto(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Show next historical photograph"
            aria-controls={carouselId}
            disabled={!hasMultiplePhotos}
            onClick={() => showPhoto(activeIndex + 1)}
          >
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
