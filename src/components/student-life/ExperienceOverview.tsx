import { FeatureCarousel } from "@/components/student-life/FeatureCarousel";
import { Container } from "@/components/ui/Container";
import { experienceSlides } from "@/data/studentLife";

export function ExperienceOverview() {
  return (
    <section id="experience" className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <FeatureCarousel
          label="Divine school experience"
          slides={experienceSlides}
          mediaSize="compact"
          autoPlayInterval={7500}
        />
      </Container>
    </section>
  );
}
