import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
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
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {academicLevels.map((level) => (
            <Card
              key={level.slug}
              title={level.title}
              description={level.description}
              href={routes.academicLevel(level.slug)}
              icon={<ContentIcon name={level.icon} className="size-6" />}
              label={`Explore ${level.title}`}
              className="min-h-[290px]"
            />
          ))}
        </div>
      </Container>
    </PatternSection>
  );
}
