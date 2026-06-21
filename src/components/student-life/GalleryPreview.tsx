"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  galleryAlbums,
  galleryHighlights,
  galleryImages,
} from "@/lib/images";
import { cn } from "@/lib/utils";
import type { ImageAlbumId, SiteImage } from "@/types/content";

type GallerySelection = "highlights" | ImageAlbumId;

const batchSize = 12;

export function GalleryPreview() {
  const [selection, setSelection] =
    useState<GallerySelection>("highlights");
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedImages = useMemo(
    () =>
      selection === "highlights"
        ? [...galleryHighlights]
        : galleryImages.filter((image) => image.album === selection),
    [selection],
  );
  const visibleImages = selectedImages.slice(0, visibleCount);
  const activeImage =
    lightboxIndex === null ? null : selectedImages[lightboxIndex];
  const isLightboxOpen = lightboxIndex !== null;
  const activeLightboxImage = activeImage
    ? ({ ...activeImage, fit: "contain" } satisfies SiteImage)
    : null;

  function selectAlbum(nextSelection: GallerySelection) {
    setSelection(nextSelection);
    setVisibleCount(batchSize);
    setLightboxIndex(null);
  }

  function openLightbox(
    index: number,
    trigger: HTMLButtonElement,
  ) {
    lastTriggerRef.current = trigger;
    setLightboxIndex(index);
  }

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? current
        : (current - 1 + selectedImages.length) %
          selectedImages.length,
    );
  }, [selectedImages.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) =>
      current === null
        ? current
        : (current + 1) % selectedImages.length,
    );
  }, [selectedImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const trigger = lastTriggerRef.current;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
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
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [closeLightbox, isLightboxOpen, showNext, showPrevious]);

  const previousImage =
    lightboxIndex === null || selectedImages.length < 2
      ? null
      : selectedImages[
          (lightboxIndex - 1 + selectedImages.length) %
            selectedImages.length
        ];
  const nextImage =
    lightboxIndex === null || selectedImages.length < 2
      ? null
      : selectedImages[(lightboxIndex + 1) % selectedImages.length];

  return (
    <section id="gallery" className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Gallery"
          title="Life at Divine"
          description="Explore classroom learning, school events, performances, achievements and community memories."
        />

        <div
          className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap"
          role="group"
          aria-label="Filter gallery by album"
        >
          <button
            type="button"
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-5 text-sm font-bold transition-colors",
              selection === "highlights"
                ? "border-curry-orange bg-curry-orange text-white"
                : "border-border bg-white text-charcoal hover:border-curry-orange hover:text-curry-orange",
            )}
            aria-pressed={selection === "highlights"}
            onClick={() => selectAlbum("highlights")}
          >
            Highlights
            <span className="ml-2 opacity-75">
              {galleryHighlights.length}
            </span>
          </button>
          {galleryAlbums.map((album) => {
            const count = galleryImages.filter(
              (image) => image.album === album.id,
            ).length;

            return (
              <button
                key={album.id}
                type="button"
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-5 text-sm font-bold transition-colors",
                  selection === album.id
                    ? "border-curry-orange bg-curry-orange text-white"
                    : "border-border bg-white text-charcoal hover:border-curry-orange hover:text-curry-orange",
                )}
                aria-pressed={selection === album.id}
                onClick={() => selectAlbum(album.id)}
              >
                {album.title}
                <span className="ml-2 opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-soft-cream px-5 py-4 text-sm leading-6 text-muted-grey">
          <Images
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-curry-orange"
          />
          <p>
            {selection === "highlights"
              ? "A curated introduction to the full school archive."
              : galleryAlbums.find((album) => album.id === selection)
                  ?.description}
          </p>
        </div>

        <div
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
        >
          {visibleImages.map((image, index) => (
            <figure
              key={image.id}
              data-gallery-image={image.id}
              className="group overflow-hidden rounded-card border border-curry-orange/10 bg-soft-cream shadow-card"
            >
              <button
                type="button"
                className="relative block aspect-[4/3] w-full overflow-hidden text-left"
                aria-label={`Open ${image.title}`}
                onClick={(event) =>
                  openLightbox(index, event.currentTarget)
                }
              >
                <ResponsiveImage
                  image={image}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-transparent"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 p-5 text-base font-bold text-white">
                  {image.title}
                </span>
              </button>
              <figcaption className="sr-only">{image.title}</figcaption>
            </figure>
          ))}
        </div>

        {visibleCount < selectedImages.length ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-curry-orange px-7 text-sm font-semibold text-white transition-colors hover:bg-deep-orange"
              onClick={() =>
                setVisibleCount((current) => current + batchSize)
              }
            >
              Load more photos
            </button>
          </div>
        ) : null}
      </Container>

      {activeLightboxImage && lightboxIndex !== null ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeLightbox();
            }
          }}
        >
          <div className="relative flex h-full w-full max-w-6xl flex-col">
            <div className="flex items-start justify-between gap-6 pb-4 text-white">
              <div>
                <p className="text-xs font-extrabold tracking-[0.16em] text-curry-orange uppercase">
                  {galleryAlbums.find(
                    (album) => album.id === activeImage?.album,
                  )?.title ?? "Gallery"}
                </p>
                <h2
                  id="gallery-lightbox-title"
                  className="mt-1 text-lg font-bold sm:text-xl"
                >
                  {activeLightboxImage.title}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-curry-orange hover:text-curry-orange"
                aria-label="Close gallery"
                onClick={closeLightbox}
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black/30">
              <ResponsiveImage
                key={activeLightboxImage.id}
                image={activeLightboxImage}
                sizes="100vw"
                loading="eager"
                className="object-contain"
              />

              {previousImage ? (
                <Image
                  src={previousImage.src}
                  alt=""
                  width={1}
                  height={1}
                  quality={previousImage.quality}
                  loading="eager"
                  className="pointer-events-none absolute size-px opacity-0"
                  aria-hidden="true"
                />
              ) : null}
              {nextImage ? (
                <Image
                  src={nextImage.src}
                  alt=""
                  width={1}
                  height={1}
                  quality={nextImage.quality}
                  loading="eager"
                  className="pointer-events-none absolute size-px opacity-0"
                  aria-hidden="true"
                />
              ) : null}

              {selectedImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute top-1/2 left-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange sm:left-5"
                    aria-label="Show previous photo"
                    onClick={showPrevious}
                  >
                    <ChevronLeft aria-hidden="true" className="size-6" />
                  </button>
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card transition-colors hover:bg-white hover:text-curry-orange sm:right-5"
                    aria-label="Show next photo"
                    onClick={showNext}
                  >
                    <ChevronRight aria-hidden="true" className="size-6" />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 text-sm text-soft-white/80">
              <p>{activeLightboxImage.caption}</p>
              <p className="shrink-0">
                {lightboxIndex + 1} / {selectedImages.length}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
