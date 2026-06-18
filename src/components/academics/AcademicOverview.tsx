import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicOverview } from "@/data/academics";

export function AcademicOverview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={academicOverview.eyebrow}
            title={academicOverview.title}
          />
          <div className="mt-6 space-y-5 text-lg leading-8 text-muted-grey">
            {academicOverview.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <ImagePlaceholder
          label={academicOverview.imageLabel}
          description={academicOverview.imageDescription}
          icon="graduation-cap"
          image={academicOverview.image}
        />
      </Container>
    </section>
  );
}
