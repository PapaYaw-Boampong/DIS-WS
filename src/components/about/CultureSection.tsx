import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { schoolCulturePoints } from "@/data/about";

export function CultureSection() {
  return (
    <section className="bg-charcoal py-20 text-white sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="School Culture"
          title="The experience we work to create"
          description="A warm, structured environment helps children feel secure enough to participate, persevere and grow."
          className="[&_h2]:text-white [&_p:last-child]:text-soft-white/80"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {schoolCulturePoints.map((point) => (
            <article
              key={point.title}
              className="rounded-card border border-white/10 bg-white/5 p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-curry-orange text-white">
                <ContentIcon name={point.icon} className="size-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold">{point.title}</h3>
              <p className="mt-3 leading-7 text-soft-white/75">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
