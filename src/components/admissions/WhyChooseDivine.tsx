import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionBenefits } from "@/data/admissions";
import { FadedBackdrop } from "@/components/ui/FadedBackdrop";
import { siteImages } from "@/lib/images";

export function WhyChooseDivine() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <FadedBackdrop image={siteImages.backdropWhyDivine} />
      <Container>
        <SectionHeader
          eyebrow="Why Divine"
          title="A school experience built around growth"
          description="Our learning environment brings academic purpose, learner wellbeing, character and family partnership together."
          align="center"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {admissionBenefits.map((benefit) => (
            <Card
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              image={benefit.image}
              icon={<ContentIcon name={benefit.icon} className="size-5" />}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
