import type { Metadata } from "next";

import { AcademicLevelsGrid } from "@/components/academics/AcademicLevelsGrid";
import { AcademicOverview } from "@/components/academics/AcademicOverview";
import { AssessmentSection } from "@/components/academics/AssessmentSection";
import { CalendarPreview } from "@/components/academics/CalendarPreview";
import { CurriculumSection } from "@/components/academics/CurriculumSection";
import { LearningResources } from "@/components/academics/LearningResources";
import { TeachersPreview } from "@/components/academics/TeachersPreview";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { academicMetadata, academicsHero } from "@/data/academics";
import { routes } from "@/lib/routes";

export const metadata: Metadata = academicMetadata.overview;

export default function AcademicsPage() {
  return (
    <>
      <PageHero
        eyebrow={academicsHero.eyebrow}
        title={academicsHero.title}
        description={academicsHero.description}
        variant="orange"
      />
      <AcademicOverview />
      <AcademicLevelsGrid />
      <CurriculumSection />
      <LearningResources />
      <AssessmentSection />
      <CalendarPreview />
      <TeachersPreview />
      <CTASection
        title="Find the right learning pathway for your child"
        description="Speak with our admissions team about academic stages, learner support and joining the Divine school community."
        primaryLabel="Apply to Divine"
        primaryHref={routes.admissions}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
