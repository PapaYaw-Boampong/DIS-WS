import type { Metadata } from "next";

import { AboutOverview } from "@/components/about/AboutOverview";
import { CultureSection } from "@/components/about/CultureSection";
import { MissionVisionValues } from "@/components/about/MissionVisionValues";
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
        images={aboutHero.images}
        preloadImage
        variant="orange"
      />
      <AboutOverview />
      <MissionVisionValues />
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
