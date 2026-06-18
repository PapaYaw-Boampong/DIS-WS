import { Check } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PatternSection } from "@/components/ui/PatternSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { AcademicLevelDetail } from "@/types/content";

type AcademicLevelContentProps = {
  level: AcademicLevelDetail;
};

export function AcademicLevelContent({ level }: AcademicLevelContentProps) {
  return (
    <>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <SectionHeader eyebrow="Level Overview" title={level.overviewTitle} />
            <div className="mt-6 space-y-5 text-lg leading-8 text-muted-grey">
              {level.overviewParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ImagePlaceholder
            label={level.imageLabel}
            description={level.imageDescription}
            icon="graduation-cap"
          />
        </Container>
      </section>

      <PatternSection>
        <Container>
          <SectionHeader
            eyebrow="Learning Areas"
            title={`What learners explore in ${level.title}`}
            description="Learning experiences are planned to establish essential knowledge, practise important skills and connect ideas to real situations."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {level.subjects.map((subject) => (
              <Card
                key={subject.title}
                title={subject.title}
                description={subject.description}
                icon={<ContentIcon name={subject.icon} className="size-6" />}
              />
            ))}
          </div>
        </Container>
      </PatternSection>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Student Development"
            title="Supporting the whole learner"
            description="Academic learning is reinforced through habits and experiences that prepare pupils to participate responsibly and confidently."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {level.developmentFocus.map((focus) => (
              <Card
                key={focus.title}
                title={focus.title}
                description={focus.description}
                icon={<ContentIcon name={focus.icon} className="size-6" />}
                className="bg-soft-white"
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft-cream py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <article className="rounded-[1.75rem] border border-border bg-white p-7 shadow-card sm:p-10">
            <p className="text-sm font-extrabold tracking-[0.16em] text-curry-orange uppercase">
              Assessment Approach
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] text-charcoal">
              {level.assessmentTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-grey">
              {level.assessmentDescription}
            </p>
            <ul className="mt-7 space-y-4">
              {level.assessmentPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-curry-orange text-white">
                    <Check
                      aria-hidden="true"
                      className="size-4"
                      strokeWidth={2.5}
                    />
                  </span>
                  <span className="leading-7 text-charcoal">{point}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.75rem] bg-charcoal p-7 text-white shadow-card sm:p-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-curry-orange">
              <ContentIcon name="users" className="size-7" />
            </div>
            <p className="mt-7 text-sm font-extrabold tracking-[0.16em] text-curry-orange uppercase">
              Teacher Support
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em]">
              {level.teacherSupportTitle}
            </h2>
            <p className="mt-5 text-lg leading-8 text-soft-white">
              {level.teacherSupportDescription}
            </p>
          </article>
        </Container>
      </section>
    </>
  );
}
