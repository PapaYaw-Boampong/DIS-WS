import { FeatureCarousel } from "@/components/student-life/FeatureCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { campusSlides } from "@/data/studentLife";

export function CampusLifeSection() {
  return (
    <section className="bg-soft-cream py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="A Day at Divine"
          title="From the bus ride in to lunch with friends"
          description="A glimpse of the routines, spaces and moments that make up a school day."
        />
        <FeatureCarousel
          label="A day at Divine carousel"
          slides={campusSlides}
          mediaSize="large"
          className="mt-12"
        />
      </Container>
    </section>
  );
}
