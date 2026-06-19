import type { Metadata } from "next";

import { LeadershipGrid } from "@/components/about/LeadershipGrid";
import { LeadershipIntroduction } from "@/components/about/LeadershipIntroduction";
import { LeadershipPhilosophy } from "@/components/about/LeadershipPhilosophy";
import { RelatedAboutLinks } from "@/components/about/RelatedAboutLinks";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { aboutMetadata } from "@/data/about";
import { routes } from "@/lib/routes";

export const metadata: Metadata = aboutMetadata.leadership;

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="About Divine"
        title="Leadership & Management"
        description="The roles and shared principles that guide learning, wellbeing and dependable school operations."
        variant="orange"
      />
      <LeadershipIntroduction />
      <LeadershipGrid />
      <LeadershipPhilosophy />
      <RelatedAboutLinks excludeHref={routes.leadership} />
      <CTASection
        title="Start a conversation with Divine"
        description="Our school team is available to answer questions about learning, admissions and family support."
        primaryLabel="Contact Us"
        primaryHref={routes.contact}
        secondaryLabel="Apply Now"
        secondaryHref={routes.admissions}
      />
    </>
  );
}
