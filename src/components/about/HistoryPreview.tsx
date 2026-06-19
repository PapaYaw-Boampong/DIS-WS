import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HistoryPhotoCarousel } from "@/components/about/HistoryPhotoCarousel";
import { historyPhotos } from "@/data/about";
import { routes } from "@/lib/routes";

export function HistoryPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Our History"
            title="A school story shaped by purpose"
            description="Our growth reflects a continuing commitment to strong learning, close family partnership and confident children."
          />
          <Button href={routes.history} variant="secondary">
            Explore Our History
          </Button>
        </div>
        <div className="mt-12">
          <HistoryPhotoCarousel photos={historyPhotos} />
        </div>
      </Container>
    </section>
  );
}
