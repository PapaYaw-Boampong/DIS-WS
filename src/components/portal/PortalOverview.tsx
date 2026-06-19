import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { portalOverview } from "@/data/portals";

export function PortalOverview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <SectionHeader
          eyebrow={portalOverview.eyebrow}
          title={portalOverview.title}
          description={portalOverview.description}
        />
        <ImagePlaceholder
          label={portalOverview.imageLabel}
          description={portalOverview.imageDescription}
          icon="lock-keyhole"
          aspect="landscape"
        />
      </Container>
    </section>
  );
}
