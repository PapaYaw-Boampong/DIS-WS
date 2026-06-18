import { Card } from "@/components/ui/Card";
import { FeatureCarousel } from "@/components/student-life/FeatureCarousel";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  activityPillars,
  activitySlides,
} from "@/data/studentLife";

export function ActivitiesSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Activities"
          title="Clubs, Sports and Culture"
          description="Large activity moments rotate one at a time, while the pillars below describe the habits these experiences help form."
        />
        <FeatureCarousel
          label="Clubs sports and culture carousel"
          slides={activitySlides}
          variant="media"
          mediaSize="wide"
          className="mt-12"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {activityPillars.map((pillar) => (
            <Card
              key={pillar.title}
              title={pillar.title}
              description={pillar.description}
              icon={<ContentIcon name={pillar.icon} className="size-6" />}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
