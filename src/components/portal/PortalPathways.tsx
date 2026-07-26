import { PortalAccessCards } from "@/components/portal/PortalAccessCards";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { portalItems } from "@/data/portals";

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
          description="Choose the access area that matches your role. Phase 1 provides protected mock previews while operational features remain offline."
        />
        <div className="mt-12 lg:pb-20">
          <PortalAccessCards items={portalItems} />
        </div>
      </Container>
    </section>
  );
}
