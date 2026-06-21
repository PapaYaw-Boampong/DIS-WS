import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import {
  principalMessageSections,
  principalProfile,
} from "@/data/about";

export function PrincipalMessage() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="lg:sticky lg:top-44">
          <AboutImagePlaceholder
            label={principalProfile.role}
            description={principalProfile.imageDescription}
            icon={principalProfile.icon}
            image={principalProfile.image}
            aspect="portrait"
          />
          <div className="mt-6 rounded-card border border-border bg-soft-white p-6">
            <p className="font-bold text-charcoal">{principalProfile.title}</p>
            <p className="mt-1 text-sm text-muted-grey">
              {principalProfile.role}
            </p>
          </div>
        </div>

        <article>
          <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
            Welcome
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl">
            A message to our families
          </h2>
          <div className="mt-8 space-y-10">
            {principalMessageSections.map((section, index) => (
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
              {principalProfile.title}
            </p>
            <p className="mt-1 text-muted-grey">
              Divine International School
            </p>
          </div>
        </article>
      </Container>
    </section>
  );
}
