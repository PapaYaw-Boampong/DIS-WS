import { FeatureCarousel } from "@/components/student-life/FeatureCarousel";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { studentVoices } from "@/data/studentLife";

export function VoicesSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Updates"
          title="Parents and Student Voices"
        />
        <FeatureCarousel
          label="Parent and student voices carousel"
          slides={studentVoices}
          textPosition="right"
          mediaSize="large"
          className="mt-12"
        />
      </Container>
    </section>
  );
}
