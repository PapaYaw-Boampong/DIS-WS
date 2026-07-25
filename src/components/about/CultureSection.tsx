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
        <div className="mt-14 grid gap-x-12 gap-y-2 sm:grid-cols-2">
          {schoolCulturePoints.map((point, index) => (
            <div
              key={point.title}
              className="flex gap-5 border-t border-white/10 py-7"
            >
              <span className="font-display text-3xl font-semibold text-curry-orange">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
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
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
