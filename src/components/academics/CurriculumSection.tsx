import { Card } from "@/components/ui/Card";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { CarouselCard } from "@/components/ui/CarouselCard";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { beyondClassroom, curriculumAreas } from "@/data/academics";

export function CurriculumSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Curriculum & Subjects"
          title="Strong foundations, connected learning"
          description="Core learning areas are taught with clarity and reinforced through discussion, practical activity and meaningful application."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {curriculumAreas.map((area) => (
            <Card
              key={area.title}
              title={area.title}
              description={area.description}
              icon={<ContentIcon name={area.icon} className="size-6" />}
            />
          ))}
        </div>

        <SectionHeader
          eyebrow="Beyond the Classroom"
          title="Learning continues through participation"
          className="mt-20"
        />
        <CardCarousel
          label="Beyond the Classroom"
          desktopVisible={3}
          className="mt-10"
        >
          {beyondClassroom.map((area) => (
            <CarouselCard
              key={area.title}
              title={area.title}
              description={area.description}
              eyebrow={area.eyebrow}
              icon={area.icon}
              image={area.image}
              imageAlt={area.imageAlt}
              className="bg-soft-white"
            />
          ))}
        </CardCarousel>
      </Container>
    </section>
  );
}
