"use client";

import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { FacilityItem } from "@/types/content";

type FacilityModalProps = {
  facility: FacilityItem;
  onClose: () => void;
};

export function FacilityModal({ facility, onClose }: FacilityModalProps) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const gallery = facility.gallery ?? [];
  const hasImages = gallery.length > 0;
  const hasMultiple = gallery.length > 1;

  const showPrevious = useCallback(() => {
    setIndex((current) => (current - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  const showNext = useCallback(() => {
    setIndex((current) => (current + 1) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && hasMultiple) {
        event.preventDefault();
        showPrevious();
        return;
      }
      if (event.key === "ArrowRight" && hasMultiple) {
        event.preventDefault();
        showNext();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [hasMultiple, onClose, showNext, showPrevious]);

  const overlay = (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="facility-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/95 p-4 sm:p-8"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-card bg-white shadow-card-strong lg:flex-row">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={`Close ${facility.title}`}
          className="absolute top-4 right-4 z-20 flex size-11 items-center justify-center rounded-full border border-border bg-white/90 text-charcoal shadow-card backdrop-blur transition-colors hover:border-curry-orange hover:text-curry-orange"
        >
          <X aria-hidden="true" className="size-5" />
        </button>

        <div className="relative min-h-[300px] w-full bg-soft-cream lg:min-h-[480px] lg:w-[58%]">
          {hasImages ? (
            <>
              {gallery.map((image, imageIndex) => (
                <div
                  key={image.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
                    imageIndex === index
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={imageIndex !== index || undefined}
                >
                  <ResponsiveImage
                    image={image}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                </div>
              ))}

              {hasMultiple ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange"
                  >
                    <ChevronLeft aria-hidden="true" className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next photo"
                    className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange"
                  >
                    <ChevronRight aria-hidden="true" className="size-5" />
                  </button>
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
                    {gallery.map((image, dotIndex) => (
                      <button
                        key={image.id}
                        type="button"
                        aria-label={`Go to photo ${dotIndex + 1}`}
                        onClick={() => setIndex(dotIndex)}
                        className={cn(
                          "size-2.5 rounded-full border border-white/70 transition-colors",
                          dotIndex === index
                            ? "bg-white"
                            : "bg-white/30 hover:bg-white/60",
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-card">
                  <ContentIcon name={facility.icon} className="size-8" />
                </div>
                <p className="text-sm font-semibold text-muted-grey">
                  Photos coming soon
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col p-6 sm:p-8 lg:w-[42%]">
          <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
            <ContentIcon name={facility.icon} className="size-6" />
          </div>
          <h2
            id="facility-modal-title"
            className="mt-5 font-display text-2xl font-semibold text-charcoal sm:text-3xl"
          >
            {facility.title}
          </h2>
          <p className="mt-4 leading-8 text-muted-grey">
            {facility.description}
          </p>
          {facility.detail ? (
            <p className="mt-4 leading-8 text-muted-grey">{facility.detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
