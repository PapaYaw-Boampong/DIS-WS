import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schoolCulturePoints.map((point, index) => (
            <article
              key={point.title}
              className="group flex flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.04]"
            >
              {point.image ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] motion-reduce:transform-none">
                    <ResponsiveImage
                      image={point.image}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent"
                  />
                  <span className="absolute bottom-4 left-5 font-display text-4xl font-semibold text-curry-orange">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              ) : null}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2.5">
                  <ContentIcon
                    name={point.icon}
                    className="size-5 shrink-0 text-curry-orange"
                  />
                  <h3 className="text-lg font-bold">{point.title}</h3>
                </div>
                <p className="mt-2 leading-7 text-soft-white/75">
                  {point.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
