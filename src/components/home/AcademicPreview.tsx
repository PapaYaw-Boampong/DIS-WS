import { Container } from "@/components/ui/Container";
import { OverlayCard } from "@/components/ui/OverlayCard";
import { PatternSection } from "@/components/ui/PatternSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicLevels } from "@/data/academics";
import { routes } from "@/lib/routes";

export function AcademicPreview() {
  return (
    <PatternSection>
      <Container>
        <SectionHeader eyebrow="Academics" title="Academic Levels" />
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
                cta="Explore"
                className={index === 1 ? "lg:mt-16" : undefined}
              />
            ) : null,
          )}
        </div>
      </Container>
    </PatternSection>
  );
}
