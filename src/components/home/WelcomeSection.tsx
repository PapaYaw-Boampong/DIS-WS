import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { welcomeContent } from "@/data/home";

export function WelcomeSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={welcomeContent.eyebrow}
            title={welcomeContent.title}
            description={welcomeContent.description}
          />
          <Button href={welcomeContent.action.href} className="mt-8">
            {welcomeContent.action.label}
          </Button>
        </div>

        <ImagePlaceholder
          label="Pupils learning together"
          description="Approved photograph of pupils learning together."
          image={welcomeContent.image}
        />
      </Container>
    </section>
  );
}
