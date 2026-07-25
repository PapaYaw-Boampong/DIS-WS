"use client";

import { useId, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionStages } from "@/data/admissions";

export function AdmissionsSteps() {
  const sectionId = useId();
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="How to Join"
          title="Admission process in three stages"
          description="A clear path from first enquiry to enrollment. Exact requirements and timing are confirmed for each application."
        />
        <div className="mt-12 space-y-4">
          {admissionStages.map((stage) => {
            const isExpanded = expandedStage === stage.step;
            const panelId = `${sectionId}-stage-${stage.step}`;

            return (
              <article
                key={stage.step}
                className="overflow-hidden rounded-card border border-border bg-white shadow-card"
              >
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-6 text-left sm:px-7"
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() =>
                      setExpandedStage(isExpanded ? null : stage.step)
                    }
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-soft-cream text-sm font-extrabold text-curry-orange">
                      {stage.step}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs font-extrabold tracking-[0.16em] text-curry-orange uppercase">
                        Stage {stage.step}
                      </span>
                      <span className="mt-1 block text-lg font-bold text-charcoal sm:text-xl">
                        {stage.title}
                      </span>
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
                  <ul className="max-w-3xl space-y-4">
                    {stage.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 leading-7 text-charcoal"
                      >
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-curry-orange text-white">
                          <Check
                            aria-hidden="true"
                            className="size-3.5"
                            strokeWidth={2.5}
                          />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
