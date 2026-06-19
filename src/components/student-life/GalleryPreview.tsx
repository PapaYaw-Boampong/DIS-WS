import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { galleryItems } from "@/data/studentLife";

export function GalleryPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Gallery" title="Gallery Preview" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <figure
              key={item.title}
              className="pattern-checker relative flex min-h-56 items-center justify-center overflow-hidden rounded-card border border-curry-orange/10 bg-soft-cream p-6"
            >
              {item.image ? (
                <>
                  <ResponsiveImage
                    image={item.image}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/85 to-transparent"
                    aria-hidden="true"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-base font-bold text-white">
                    {item.title}
                  </figcaption>
                </>
              ) : (
                <>
                  <div
                    className="absolute -right-12 -bottom-12 size-40 rounded-full bg-curry-orange/10"
                    aria-hidden="true"
                  />
                  <div
                    role="img"
                    aria-label={item.description}
                    className="relative flex flex-col items-center gap-4 text-center"
                  >
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-card">
                      <ContentIcon name={item.icon} className="size-7" />
                    </div>
                    <span className="text-sm font-bold text-charcoal/70">
                      {item.title}
                    </span>
                  </div>
                </>
              )}
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
