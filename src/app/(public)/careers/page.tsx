import type { Metadata } from "next";

import {
  CareerBenefits,
  CareersIntro,
  HowToApply,
} from "@/components/careers/CareersSections";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { careersHero, careersMetadata } from "@/data/careers";
import { school } from "@/data/school";
import { routes } from "@/lib/routes";

export const metadata: Metadata = careersMetadata;

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow={careersHero.eyebrow}
        title={careersHero.title}
        description={careersHero.description}
        variant="orange"
      />
      <CareersIntro />
      <HowToApply />
      <CareerBenefits />
      <CTASection
        title="Ready to apply?"
        description="Send your application, CV and a passport photograph to our hiring team. We look forward to hearing from you."
        primaryLabel="Email Your Application"
        primaryHref={`mailto:${school.email}`}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
