import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutValues } from "@/data/about";

export function MissionVisionValues() {
  return (
    <section className="pattern-checker py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Our Foundation"
          title="Mission, vision and values"
          description="The principles that guide learning, relationships and decision-making across our school community."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {aboutValues.map((value) => (
            <article
              key={value.title}
              className="flex min-h-[290px] flex-col rounded-card border border-border bg-white p-8 shadow-card"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <ContentIcon name={value.icon} className="size-7" />
              </div>
              <h3 className="mt-7 text-2xl font-bold text-charcoal">
                {value.title}
              </h3>
              <p className="mt-4 leading-7 text-muted-grey">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
