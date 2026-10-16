import Image from "next/image";
import { ArrowUpRight, Images } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PhotoAlbumItem } from "@/types/content";

type PhotoAlbumsSectionProps = {
  readonly albums: readonly PhotoAlbumItem[];
};

const providerLabels: Record<string, string> = {
  google_photos: "Google Photos",
};

/**
 * Full event albums the school has shared. The photographs stay where the
 * school already publishes them; the site links out rather than re-hosting
 * hundreds of images it would then have to store, optimise and keep in step.
 *
 * Renders nothing when there are no albums — an empty "photo albums" heading
 * would read as something broken.
 */
export function PhotoAlbumsSection({ albums }: PhotoAlbumsSectionProps) {
  if (albums.length === 0) {
    return null;
  }

  return (
    <section className="bg-soft-white py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow="Full albums"
          title="Photos from our events"
          description="Every photograph from our recent events, shared as full albums you can browse and download."
        />

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <li key={album.id}>
              <a
                href={album.albumUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-soft-cream">
                  {album.image ? (
                    <ResponsiveImage
                      image={album.image}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : album.imageUrl ? (
                    <Image
                      src={album.imageUrl}
                      alt={album.imageAlt ?? album.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-curry-orange">
                      <Images aria-hidden="true" className="size-10" />
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {album.occasionLabel ? (
                    <p className="text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
                      {album.occasionLabel}
                    </p>
                  ) : null}
                  <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-charcoal">
                    {album.title}
                  </h3>
                  {album.description ? (
                    <p className="mt-2 leading-7 text-muted-grey">
                      {album.description}
                    </p>
                  ) : null}

                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-deep-orange">
                    View album on{" "}
                    {providerLabels[album.provider] ?? "the shared album"}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm leading-6 text-muted-grey">
          Albums open on an external site in a new tab.
        </p>
      </Container>
    </section>
  );
}
