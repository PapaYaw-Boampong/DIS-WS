import type { Metadata } from "next";

import { PrincipalMessage } from "@/components/about/PrincipalMessage";
import { RelatedAboutLinks } from "@/components/about/RelatedAboutLinks";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { aboutMetadata } from "@/data/about";
import { routes } from "@/lib/routes";

export const metadata: Metadata = aboutMetadata.principalMessage;

export default function PrincipalMessagePage() {
  return (
    <>
      <PageHero
        eyebrow="School Leadership"
        title="A Message from the Principal"
        description="A welcome to current and prospective families from the leadership of Divine International School."
        variant="orange"
      />
      <PrincipalMessage />
      <RelatedAboutLinks excludeHref={routes.principalMessage} />
      <CTASection
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
