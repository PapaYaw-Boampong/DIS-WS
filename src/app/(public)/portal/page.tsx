import type { Metadata } from "next";

import { PortalAccessNotes } from "@/components/portal/PortalAccessNotes";
import { PortalHero } from "@/components/portal/PortalHero";
import { PortalOverview } from "@/components/portal/PortalOverview";
import { PortalPathways } from "@/components/portal/PortalPathways";
import { CTASection } from "@/components/ui/CTASection";
import { portalMetadata } from "@/data/portals";
import { routes } from "@/lib/routes";

export const metadata: Metadata = portalMetadata;

export default function PortalPage() {
  return (
    <>
      <PortalHero />
      <PortalOverview />
      <PortalPathways />
      <PortalAccessNotes />
      <CTASection
        title="Need portal support?"
        description="Contact the school for current access guidance while the portal system is being prepared."
        primaryLabel="Contact Support"
        primaryHref={routes.contact}
        secondaryLabel="Find the School"
        secondaryHref={routes.location}
      />
    </>
  );
}
