import { FeatureCarousel } from "@/components/student-life/FeatureCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { campusSlides } from "@/data/studentLife";

export function CampusLifeSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Campus" title="See The Campus" />
        <FeatureCarousel
          label="Campus life carousel"
          slides={campusSlides}
          mediaSize="large"
          className="mt-12"
        />
      </Container>
    </section>
  );
}
