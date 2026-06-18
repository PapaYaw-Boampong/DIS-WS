import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { galleryItems } from "@/data/studentLife";

export function GalleryPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Gallery" title="Gallery Preview" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div
              key={item.title}
              role="img"
              aria-label={item.description}
              className="pattern-checker relative flex min-h-56 items-center justify-center overflow-hidden rounded-card border border-curry-orange/10 bg-soft-cream p-6"
            >
              <div
                className="absolute -right-12 -bottom-12 size-40 rounded-full bg-curry-orange/10"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-card">
                  <ContentIcon name={item.icon} className="size-7" />
                </div>
                <span className="text-sm font-bold text-charcoal/70">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
