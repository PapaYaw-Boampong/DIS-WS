import type { Metadata } from "next";

import { HistoryLegacy } from "@/components/about/HistoryLegacy";
import { HistoryOrigin } from "@/components/about/HistoryOrigin";
import { HistoryTimeline } from "@/components/about/HistoryTimeline";
import { RelatedAboutLinks } from "@/components/about/RelatedAboutLinks";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { aboutMetadata, historyHero } from "@/data/about";
import { routes } from "@/lib/routes";

export const metadata: Metadata = aboutMetadata.history;

export default function HistoryPage() {
  return (
    <>
      <PageHero
        eyebrow={historyHero.eyebrow}
        title={historyHero.title}
        description={historyHero.description}
        image={historyHero.image}
        preloadImage
        variant="orange"
      />
      <HistoryOrigin />
      <HistoryTimeline />
      <HistoryLegacy />
      <RelatedAboutLinks excludeHref={routes.history} />
      <CTASection
        title="Become part of the next chapter"
        description="Learn more about Divine or begin an admissions conversation with our school team."
        primaryLabel="Apply Now"
        primaryHref={routes.admissions}
        secondaryLabel="About Divine"
        secondaryHref={routes.about}
      />
    </>
  );
}
