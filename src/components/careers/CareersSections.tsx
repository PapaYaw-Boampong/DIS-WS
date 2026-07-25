import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { careerBenefits, careerSteps, careersIntro } from "@/data/careers";

export function CareersIntro() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow={careersIntro.eyebrow}
          title={careersIntro.title}
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:gap-10">
          {careersIntro.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-8 text-muted-grey">
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HowToApply() {
  return (
    <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="How to Apply"
          title="Applying is straightforward"
          description="We welcome applications year-round and keep them on file for suitable openings."
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {careerSteps.map((item) => (
            <li
              key={item.step}
              className="rounded-card border border-border bg-white p-6 shadow-card sm:p-7"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-soft-cream text-sm font-extrabold text-curry-orange">
                {item.step}
              </span>
              <h3 className="mt-5 text-lg font-bold text-charcoal">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-grey">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function CareerBenefits() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Benefits"
          title="A supportive place to work and grow"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {careerBenefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-card border border-border bg-white p-6 shadow-card sm:p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                <ContentIcon name={benefit.icon} className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-charcoal">
                {benefit.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-grey">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
