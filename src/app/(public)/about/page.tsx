import type { Metadata } from "next";

import { AboutOverview } from "@/components/about/AboutOverview";
import { CultureSection } from "@/components/about/CultureSection";
import { HistoryPreview } from "@/components/about/HistoryPreview";
import { LeadershipPreview } from "@/components/about/LeadershipPreview";
import { MissionVisionValues } from "@/components/about/MissionVisionValues";
import { PrincipalPreview } from "@/components/about/PrincipalPreview";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { aboutHero, aboutMetadata } from "@/data/about";
import { routes } from "@/lib/routes";

export const metadata: Metadata = aboutMetadata.overview;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={aboutHero.eyebrow}
        title={aboutHero.title}
        description={aboutHero.description}
        image={aboutHero.image}
        preloadImage
        variant="orange"
      />
      <AboutOverview />
      <PrincipalPreview />
      <MissionVisionValues />
      <HistoryPreview />
      <LeadershipPreview />
      <CultureSection />
      <CTASection
        title="Discover a school community built around your child"
        description="Speak with our team about admissions, learning and what families can expect from the Divine experience."
        primaryLabel="Apply to Divine"
        primaryHref={routes.admissions}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
