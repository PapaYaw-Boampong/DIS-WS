import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import {
  mummyMessageSections,
  mummyProfile,
} from "@/data/about";

export function MummyMessage() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-44">
          <AboutImagePlaceholder
            label={mummyProfile.role}
            description={mummyProfile.imageDescription}
            icon={mummyProfile.icon}
            image={mummyProfile.image}
            aspect="portrait"
          />
          <div className="mt-6 rounded-card border border-border bg-soft-white p-6">
            <p className="font-bold text-charcoal">{mummyProfile.name}</p>
            <p className="mt-1 text-sm font-semibold text-charcoal/80">
              {mummyProfile.title}
            </p>
            <p className="mt-1 text-sm text-muted-grey">
              {mummyProfile.role}
            </p>
          </div>
        </div>

        <article>
          <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
            From Mummy
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl">
            A message to our families
          </h2>
          <blockquote className="mt-8 border-l-4 border-curry-orange bg-soft-cream px-6 py-5 font-display text-xl leading-9 text-charcoal sm:text-2xl sm:leading-10">
            “{mummyProfile.quote}”
          </blockquote>
          <div className="mt-8 space-y-10">
            {mummyMessageSections.map((section, index) => (
              <section key={section.heading ?? `message-${index}`}>
                {section.heading ? (
                  <h3 className="text-2xl font-bold text-charcoal">
                    {section.heading}
                  </h3>
                ) : null}
                <div
                  className={
                    section.heading
                      ? "mt-4 space-y-5 text-lg leading-8 text-muted-grey"
                      : "space-y-5 text-lg leading-8 text-muted-grey"
                  }
                >
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="text-xl font-bold text-charcoal">
              {mummyProfile.name}
            </p>
            <p className="mt-1 text-muted-grey">
              {mummyProfile.title}, Divine International School
            </p>
          </div>
        </article>
      </Container>
    </section>
  );
}
