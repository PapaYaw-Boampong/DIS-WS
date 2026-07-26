"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";

type ViewerStatus = "loading" | "ready" | "error";

type CalendarPdfViewerProps = {
  readonly src: string;
};

// Renders the school-calendar PDF as a page-turning flipbook. PDF.js and
// page-flip (StPageFlip) are browser-only, so they're imported lazily inside
// the effect — they never run during SSR. Reduced-motion users and any render
// failure fall back to an embedded PDF with a download link.
export function CalendarPdfViewer({ src }: CalendarPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Type-only import (erased at runtime, so page-flip never loads during SSR).
  const flipRef = useRef<import("page-flip").PageFlip | null>(null);

  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [useFallback, setUseFallback] = useState(false);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        setUseFallback(true);
        setStatus("ready");
        return;
      }
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs.getDocument({ url: src }).promise;
        const images: string[] = [];
        let aspect = 1.414; // default A4 portrait height/width

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const pdfPage = await pdf.getPage(pageNumber);
          const baseViewport = pdfPage.getViewport({ scale: 1 });
          if (pageNumber === 1) {
            aspect = baseViewport.height / baseViewport.width;
          }
          const scale = Math.min(2, 1400 / baseViewport.width);
          const viewport = pdfPage.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("no 2d context");
          await pdfPage.render({ canvasContext: context, viewport, canvas })
            .promise;
          images.push(canvas.toDataURL("image/jpeg", 0.85));
          if (cancelled) return;
        }

        if (cancelled || !containerRef.current) return;

        const { PageFlip } = await import("page-flip");
        const baseWidth = 500;
        const baseHeight = Math.round(baseWidth * aspect);
        const flip = new PageFlip(containerRef.current, {
          width: baseWidth,
          height: baseHeight,
          size: "stretch",
          minWidth: 260,
          maxWidth: 720,
          minHeight: 340,
          maxHeight: 1000,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: true,
          usePortrait: true,
        });
        flip.loadFromImages(images);
        flip.on("flip", (event: { data: number }) => {
          setPage(event.data);
        });
        flipRef.current = flip;
        setPageCount(flip.getPageCount());
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setUseFallback(true);
          setStatus("ready");
        }
      }
    }

    void build();

    return () => {
      cancelled = true;
      try {
        flipRef.current?.destroy();
      } catch {
        // ignore teardown errors
      }
      flipRef.current = null;
    };
  }, [src]);

  const goPrev = useCallback(() => flipRef.current?.flipPrev(), []);
  const goNext = useCallback(() => flipRef.current?.flipNext(), []);

  if (useFallback) {
    return (
      <div className="space-y-4">
        <iframe
          src={src}
          title="School calendar"
          className="h-[80vh] w-full rounded-card border border-border bg-white shadow-card"
        />
        <a
          href={src}
          download
          className="inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
        >
          <Download aria-hidden="true" className="size-4" />
          Download the calendar (PDF)
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {status === "loading" ? (
        <div className="flex min-h-[420px] items-center justify-center gap-3 text-muted-grey">
          <Loader2 aria-hidden="true" className="size-6 animate-spin" />
          <span className="text-sm font-semibold">Preparing the calendar…</span>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="w-full max-w-3xl"
        aria-label="School calendar flipbook"
      />

      {status === "ready" ? (
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal shadow-card transition-colors hover:border-curry-orange hover:text-curry-orange"
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <p className="text-sm font-semibold text-muted-grey" aria-live="polite">
            Page {Math.min(page + 1, pageCount)} of {pageCount}
          </p>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-charcoal shadow-card transition-colors hover:border-curry-orange hover:text-curry-orange"
            aria-label="Next page"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
          <a
            href={src}
            download
            className="ml-2 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
          >
            <Download aria-hidden="true" className="size-4" />
            Download
          </a>
        </div>
      ) : null}
    </div>
  );
}
