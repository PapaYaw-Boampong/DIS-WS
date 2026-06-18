import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  portalAccessSteps,
  portalPrivacyNotes,
} from "@/data/portals";

export function PortalAccessNotes() {
  return (
    <>
      <section className="pattern-checker py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Access"
            title="How access will work"
            description="Portal access will be activated through official school processes once the system is approved."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {portalAccessSteps.map((step) => (
              <Card
                key={step.title}
                title={step.title}
                description={step.description}
                icon={<ContentIcon name={step.icon} className="size-6" />}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="rounded-[2rem] border border-border bg-white p-7 shadow-card sm:p-10 lg:p-12">
            <SectionHeader
              eyebrow="Privacy"
              title="Access and Privacy Notes"
              description="These notes explain the public website scope while full portal systems are not active."
            />
            <div className="mt-8 space-y-5 text-lg leading-8 text-muted-grey">
              {portalPrivacyNotes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
