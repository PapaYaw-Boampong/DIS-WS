"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { SchoolDocument } from "@/types/content";

type DocumentViewerProps = {
  document: SchoolDocument;
  onClose: () => void;
};

// Fullscreen paged reader for a document's page images. Forked from the gallery
// lightbox: index paging with wraparound, Escape/Arrow keys, Tab focus-trap,
// body-scroll-lock, focus restore, page counter + dots, neighbour preload.
export function DocumentViewer({
  document: doc,
  onClose,
}: DocumentViewerProps) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const pages = doc.pages;
  const count = pages.length;
  const hasMultiple = count > 1;

  const showPrevious = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count);
  }, [count]);

  const showNext = useCallback(() => {
    setIndex((current) => (current + 1) % count);
  }, [count]);

  useEffect(() => {
    const previousOverflow = window.document.body.style.overflow;
    const trigger = window.document.activeElement as HTMLElement | null;
    window.document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

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

      if (event.shiftKey && window.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && window.document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.document.removeEventListener("keydown", handleKeyDown);
      window.document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [hasMultiple, onClose, showNext, showPrevious]);

  const activePage = pages[index];

  if (!activePage) {
    return null;
  }

  const previousPage = hasMultiple
    ? pages[(index - 1 + count) % count]
    : null;
  const nextPage = hasMultiple ? pages[(index + 1) % count] : null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/95 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-viewer-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="relative flex h-full w-full max-w-5xl flex-col">
        <div className="flex items-start justify-between gap-6 pb-4 text-white">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-curry-orange uppercase">
              Document
            </p>
            <h2
              id="document-viewer-title"
              className="mt-1 text-lg font-bold sm:text-xl"
            >
              {doc.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-curry-orange hover:text-curry-orange"
            aria-label="Close document"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black/30">
          <Image
            key={activePage.src}
            src={activePage.src}
            alt={activePage.alt}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />

          {previousPage ? (
            <Image
              src={previousPage.src}
              alt=""
              width={1}
              height={1}
              className="pointer-events-none absolute size-px opacity-0"
              aria-hidden="true"
            />
          ) : null}
          {nextPage ? (
            <Image
              src={nextPage.src}
              alt=""
              width={1}
              height={1}
              className="pointer-events-none absolute size-px opacity-0"
              aria-hidden="true"
            />
          ) : null}

          {hasMultiple ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange sm:left-5"
                aria-label="Previous page"
                onClick={showPrevious}
              >
                <ChevronLeft aria-hidden="true" className="size-6" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange sm:right-5"
                aria-label="Next page"
                onClick={showNext}
              >
                <ChevronRight aria-hidden="true" className="size-6" />
              </button>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 text-sm text-soft-white/80">
          {hasMultiple ? (
            <div className="flex items-center gap-2" aria-hidden="true">
              {pages.map((page, pageIndex) => (
                <button
                  key={page.src}
                  type="button"
                  className={cn(
                    "size-2.5 rounded-full border border-white/70 transition-colors",
                    pageIndex === index
                      ? "bg-white"
                      : "bg-white/25 hover:bg-white/60",
                  )}
                  tabIndex={-1}
                  aria-label={`Go to page ${pageIndex + 1}`}
                  onClick={() => setIndex(pageIndex)}
                />
              ))}
            </div>
          ) : (
            <span />
          )}
          <p className="shrink-0" aria-live="polite">
            Page {index + 1} of {count}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
