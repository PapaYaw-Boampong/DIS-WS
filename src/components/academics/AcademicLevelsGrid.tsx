import { Container } from "@/components/ui/Container";
import { OverlayCard } from "@/components/ui/OverlayCard";
import { PatternSection } from "@/components/ui/PatternSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicLevels } from "@/data/academics";
import { routes } from "@/lib/routes";

export function AcademicLevelsGrid() {
  return (
    <PatternSection>
      <Container>
        <SectionHeader
          eyebrow="Academic Levels"
          title="A clear pathway through every stage"
          description="Each stage responds to the learner's age and growing independence while maintaining consistent expectations for care, effort and progress."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {academicLevels.map((level, index) =>
            level.image ? (
              <OverlayCard
                key={level.slug}
                title={level.title}
                eyebrow={level.eyebrow}
                icon={level.icon}
                image={level.image}
                href={routes.academicLevel(level.slug)}
                cta={`Explore ${level.title}`}
                className={index === 1 ? "lg:mt-16" : undefined}
              />
            ) : null,
          )}
        </div>
      </Container>
    </PatternSection>
  );
}
