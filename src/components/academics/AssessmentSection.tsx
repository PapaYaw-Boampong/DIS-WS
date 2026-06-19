import { Check } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { assessmentApproach } from "@/data/academics";

export function AssessmentSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <SectionHeader
          eyebrow={assessmentApproach.eyebrow}
          title={assessmentApproach.title}
          description={assessmentApproach.description}
        />
        <ul className="grid gap-4 sm:grid-cols-2">
          {assessmentApproach.points.map((point) => (
            <li
              key={point}
              className="flex min-h-28 items-start gap-4 rounded-card border border-border bg-soft-white p-5"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-curry-orange text-white">
                <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
              </span>
              <span className="font-semibold leading-7 text-charcoal">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
