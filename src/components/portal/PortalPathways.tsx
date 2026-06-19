import { PortalAccessCards } from "@/components/portal/PortalAccessCards";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { portalItems, portalNotice } from "@/data/portals";

export function PortalPathways() {
  return (
    <section
      id="portal-pathways"
      className="scroll-mt-24 bg-white py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <SectionHeader
          eyebrow="Pathways"
          title="Manage Your Life"
          description="Choose the access area that matches your role in the school community. Full portal functionality is not active yet."
        />
        <div className="mt-12 lg:pb-20">
          <PortalAccessCards items={portalItems} notice={portalNotice} />
        </div>
      </Container>
    </section>
  );
}
