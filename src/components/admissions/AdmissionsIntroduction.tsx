import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionsIntroduction } from "@/data/admissions";

export function AdmissionsIntroduction() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow={admissionsIntroduction.eyebrow}
          title={admissionsIntroduction.title}
          align="center"
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-8 text-muted-grey">
          {admissionsIntroduction.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}
