import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { Container } from "@/components/ui/Container";
import { OverlayCard } from "@/components/ui/OverlayCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { facilities } from "@/data/facilities";
import { routes } from "@/lib/routes";

// Home-page tour of the campus: one image-led card per facility, drawn from
// the same data as the Facilities page so the two never disagree.
export function FacilitiesPreview() {
  const items = facilities.filter((facility) => facility.image);

  return (
    <section className="bg-soft-cream py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Our Campus"
            title="Facilities for everyday learning"
            description="Bright classrooms, an Edu Lab, a well-stocked library, a science lab, a supervised canteen and school buses."
          />
          <Link
            href={routes.facilities}
            className="inline-flex shrink-0 items-center gap-2 font-semibold text-curry-orange transition-colors hover:text-deep-orange"
          >
            Explore all facilities
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <CardCarousel label="School facilities" className="mt-12">
          {items.map((facility) =>
            facility.image ? (
              <OverlayCard
                key={facility.title}
                title={facility.title}
                eyebrow="Facilities"
                icon={facility.icon}
                image={facility.image}
                href={routes.facilities}
                cta="Take a look"
                aspect="portrait"
              />
            ) : null,
          )}
        </CardCarousel>
      </Container>
    </section>
  );
}
