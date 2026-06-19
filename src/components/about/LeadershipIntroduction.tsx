import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function LeadershipIntroduction() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow="Working Together"
            title="Leadership that supports every part of school life"
          />
          <div className="mt-6 space-y-5 text-lg leading-8 text-muted-grey">
            <p>
              Divine International School is guided by leadership roles that
              connect academic quality, pupil wellbeing, staff development and
              dependable daily operations.
            </p>
            <p>
              The team works collaboratively, with clear responsibilities and
              a shared commitment to the school&apos;s values and the needs of
              every learner.
            </p>
          </div>
        </div>
        <AboutImagePlaceholder
          label="Divine leadership team"
          description="Placeholder for an approved group photograph of the Divine International School leadership team."
          icon="users"
        />
      </Container>
    </section>
  );
}
