import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutOverview } from "@/data/about";

export function AboutOverview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={aboutOverview.eyebrow}
            title={aboutOverview.title}
          />
          <div className="mt-6 space-y-5 text-lg leading-8 text-muted-grey">
            {aboutOverview.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ul className="mt-8 space-y-3">
            {aboutOverview.highlights.map((highlight) => (
              <li key={highlight.label} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-cream text-curry-orange">
                  <ContentIcon name={highlight.icon} className="size-5" />
                </span>
                <span className="font-semibold text-charcoal">
                  {highlight.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <AboutImagePlaceholder
          label={aboutOverview.imageLabel}
          description={aboutOverview.imageDescription}
          icon="users"
          image={aboutOverview.image}
        />
      </Container>
    </section>
  );
}
