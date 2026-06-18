import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { historyOrigin } from "@/data/about";

export function HistoryOrigin() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AboutImagePlaceholder
          label={historyOrigin.imageLabel}
          description={historyOrigin.imageDescription}
          icon="landmark"
        />
        <div>
          <SectionHeader
            eyebrow={historyOrigin.eyebrow}
            title={historyOrigin.title}
          />
          <div className="mt-6 space-y-5 text-lg leading-8 text-muted-grey">
            {historyOrigin.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
