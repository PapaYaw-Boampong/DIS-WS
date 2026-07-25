import { Container } from "@/components/ui/Container";
import { OverlayCard } from "@/components/ui/OverlayCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { homePathways } from "@/data/home";

export function JoinPathways() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeader eyebrow="Pathways" title="Join Divine as..." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {homePathways.map((pathway, index) =>
            pathway.image ? (
              <OverlayCard
                key={pathway.title}
                title={pathway.title}
                eyebrow={pathway.eyebrow}
                icon={pathway.icon}
                image={pathway.image}
                href={pathway.href}
                cta="Get started"
                className={index === 1 ? "lg:mt-16" : undefined}
              />
            ) : null,
          )}
        </div>
      </Container>
    </section>
  );
}
