import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { campusOverview } from "@/data/facilities";

export function FacilitiesOverview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            eyebrow={campusOverview.eyebrow}
            title={campusOverview.title}
          />
          <div className="mt-6 space-y-5">
            {campusOverview.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-8 text-muted-grey">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <ImagePlaceholder
          label="Divine International School campus"
          description="Placeholder for an approved photograph of the Divine International School campus."
          icon="school"
          aspect="landscape"
        />
      </Container>
    </section>
  );
}
