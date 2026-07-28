import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { imageById } from "@/lib/images";
import { admissionsIntroduction } from "@/data/admissions";

export function AdmissionsIntroduction() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow={admissionsIntroduction.eyebrow}
          title={admissionsIntroduction.title}
          align="center"
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-8 text-muted-grey">
          {admissionsIntroduction.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="relative mx-auto mt-12 aspect-[16/9] max-w-4xl overflow-hidden rounded-card border border-border bg-soft-cream shadow-card">
          <ResponsiveImage
            image={imageById["events-career-day-mix2"]}
            sizes="(min-width: 1024px) 900px, 100vw"
          />
        </div>
      </Container>
    </section>
  );
}
