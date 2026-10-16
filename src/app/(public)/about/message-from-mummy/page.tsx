import type { Metadata } from "next";

import { MummyMessage } from "@/components/about/MummyMessage";
import { RelatedAboutLinks } from "@/components/about/RelatedAboutLinks";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { aboutMetadata } from "@/data/about";
import { routes } from "@/lib/routes";
import { siteImages } from "@/lib/images";

export const metadata: Metadata = aboutMetadata.mummyMessage;

export default function MummyMessagePage() {
  return (
    <>
      <PageHero
        eyebrow="From Our Co-Director"
        title="A Message from Mummy"
        description="Vivian Agbeme Boampong on the immense potential in every child, and the care and attention it takes to draw it out."
        variant="orange"
      />
      <MummyMessage />
      <RelatedAboutLinks excludeHref={routes.mummyMessage} />
      <CTASection
        backgroundImage={siteImages.ctaCourtyard}
        title="We look forward to welcoming your family"
        description="Contact the school to ask a question, arrange a conversation or begin the admissions process."
        primaryLabel="Apply Now"
        primaryHref={routes.admissions}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
