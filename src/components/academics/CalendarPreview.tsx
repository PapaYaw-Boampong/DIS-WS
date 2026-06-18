import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicTerms } from "@/data/academics";
import { routes } from "@/lib/routes";

export function CalendarPreview() {
  return (
    <section className="pattern-checker py-20 sm:py-24 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <div>
          <SectionHeader
            eyebrow="Academic Calendar"
            title="Plan around the school year"
            description="The calendar brings term priorities and school community events together in one place."
          />
          <Link
            href={routes.calendar}
            className="mt-7 inline-flex items-center gap-2 font-semibold text-curry-orange transition-colors hover:text-deep-orange"
          >
            View School Calendar
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {academicTerms.map((term) => (
            <article
              key={term.name}
              className="rounded-card border border-border bg-white p-6 shadow-card"
            >
              <ContentIcon
                name="calendar"
                className="size-7 text-curry-orange"
              />
              <p className="mt-5 text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                {term.period}
              </p>
              <h3 className="mt-2 text-xl font-bold text-charcoal">
                {term.name}
              </h3>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
