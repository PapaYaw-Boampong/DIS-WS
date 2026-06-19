import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { historyMilestones } from "@/data/about";
import type { HistoryMilestone } from "@/types/content";

type HistoryTimelineProps = {
  milestones?: readonly HistoryMilestone[];
  showHeader?: boolean;
};

export function HistoryTimeline({
  milestones = historyMilestones,
  showHeader = true,
}: HistoryTimelineProps) {
  return (
    <section className="pattern-checker py-20 sm:py-24 lg:py-28">
      <Container>
        {showHeader ? (
          <SectionHeader
            eyebrow="Our Journey"
            title="The Divine story continues"
            description="Key stages in the development of a caring, future-focused school community."
          />
        ) : null}
        <ol className={showHeader ? "mt-12" : undefined}>
          {milestones.map((milestone, index) => (
            <li
              key={milestone.period}
              className="relative grid gap-5 pb-10 pl-14 last:pb-0 md:grid-cols-[0.35fr_1fr] md:gap-10 md:pl-16"
            >
              {index < milestones.length - 1 ? (
                <span
                  className="absolute top-10 bottom-0 left-[1.125rem] w-px bg-curry-orange/35 md:left-[1.375rem]"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className="absolute top-1 left-0 flex size-9 items-center justify-center rounded-full bg-curry-orange text-sm font-extrabold text-white shadow-sm md:size-11"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="text-sm font-extrabold tracking-[0.14em] text-curry-orange uppercase md:pt-2">
                {milestone.period}
              </p>
              <div className="rounded-card border border-border bg-white p-7 shadow-card">
                <h3 className="text-xl font-bold text-charcoal sm:text-2xl">
                  {milestone.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-grey">
                  {milestone.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
