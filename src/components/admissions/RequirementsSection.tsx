import { Check } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionRequirements } from "@/data/admissions";

export function RequirementsSection() {
  return (
    <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Prepare Your Application"
          title="Required documents"
          description="This checklist is a general guide. Admissions will confirm the final documents required for the learner's academic stage and circumstances."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {admissionRequirements.map((group) => (
            <article
              key={group.title}
              className="rounded-card border border-border bg-white p-6 shadow-card sm:p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                <ContentIcon name={group.icon} className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-charcoal">
                {group.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-grey">
                {group.description}
              </p>
              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 leading-7 text-charcoal"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-curry-orange"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
