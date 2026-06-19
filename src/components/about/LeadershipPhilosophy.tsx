import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { leadershipPhilosophy } from "@/data/about";

export function LeadershipPhilosophy() {
  return (
    <section className="pattern-checker py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="How We Lead"
          title="Leadership grounded in responsibility"
          description="Our management approach keeps learner wellbeing, teaching quality and reliable school service at the centre."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {leadershipPhilosophy.map((principle) => (
            <article
              key={principle.title}
              className="rounded-card border border-border bg-white p-8 shadow-card"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <ContentIcon name={principle.icon} className="size-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-charcoal">
                {principle.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-grey">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
