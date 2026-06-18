"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionSteps } from "@/data/admissions";

export function AdmissionsSteps() {
  const sectionId = useId();
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="How to Join"
          title="Admission Process"
          description="Follow these stages with guidance from Admissions. Exact requirements and timing will be confirmed for each application."
        />
        <div className="mt-12 space-y-4">
          {admissionSteps.map((item) => {
            const isExpanded = expandedStep === item.step;
            const panelId = `${sectionId}-step-${item.step}`;

            return (
              <article
                key={item.step}
                className="overflow-hidden rounded-card border border-border bg-white shadow-card"
              >
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-6 text-left sm:px-7"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() =>
                      setExpandedStep(isExpanded ? null : item.step)
                    }
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-cream text-sm font-extrabold text-curry-orange">
                      {item.step}
                    </span>
                    <span className="flex-1 text-lg font-bold text-charcoal sm:text-xl">
                      {item.title}
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-charcoal">
                      {isExpanded ? (
                        <Minus aria-hidden="true" className="size-5" />
                      ) : (
                        <Plus aria-hidden="true" className="size-5" />
                      )}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  hidden={!isExpanded}
                  className="border-t border-border px-5 py-6 sm:px-[5.75rem]"
                >
                  <p className="max-w-3xl leading-7 text-muted-grey">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
