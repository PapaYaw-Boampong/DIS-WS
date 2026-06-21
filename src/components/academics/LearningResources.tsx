import { CardCarousel } from "@/components/ui/CardCarousel";
import { CarouselCard } from "@/components/ui/CarouselCard";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { learningResources } from "@/data/academics";

export function LearningResources() {
  return (
    <section className="bg-soft-cream py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Teaching & Learning Resources"
          title="Practical support for consistent progress"
          description="Resources are selected and used to make ideas clearer, practise important skills and respond to learner needs."
        />
        <CardCarousel
          label="Teaching and Learning Resources"
          desktopVisible={4}
          className="mt-12"
        >
          {learningResources.map((resource) => (
            <CarouselCard
              key={resource.title}
              title={resource.title}
              description={resource.description}
              eyebrow={resource.eyebrow}
              icon={resource.icon}
              image={resource.image}
            />
          ))}
        </CardCarousel>
      </Container>
    </section>
  );
}
