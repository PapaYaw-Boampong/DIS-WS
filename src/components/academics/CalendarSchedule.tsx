import { ChevronDown } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicTerms } from "@/data/academics";
import { calendarEvents } from "@/data/events";

export function CalendarSchedule() {
  return (
    <>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeader
            eyebrow="2026 Academic Year"
            title="The school year at a glance"
            description="Official opening, closing and event dates will be published after school approval. The term structure below provides a clear planning overview without presenting unconfirmed dates."
          />
          <div className="space-y-4">
            {academicTerms.map((term, index) => (
              <details
                key={term.name}
                open={index === 0}
                className="group rounded-card border border-border bg-soft-white shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 sm:p-8">
                  <span>
                    <span className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                      {term.period}
                    </span>
                    <span className="mt-1 block text-xl font-bold text-charcoal">
                      {term.name}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-curry-orange transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-border px-6 pt-5 pb-7 sm:px-8 sm:pb-8">
                  <p className="leading-7 text-muted-grey">{term.description}</p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                    {term.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-6 text-charcoal"
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pattern-checker py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="School Community"
            title="Events across the academic year"
            description="Confirmed dates will be added when the official calendar is released."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {calendarEvents.map((event) => (
              <article
                key={event.title}
                className="flex min-h-[360px] flex-col overflow-hidden rounded-card border border-border bg-white shadow-card"
              >
                {event.image ? (
                  <div className="relative aspect-[4/3] bg-soft-cream">
                    <ResponsiveImage
                      image={event.image}
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                    <ContentIcon name={event.icon} className="size-6" />
                  </div>
                  <p className="mt-6 text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                    {event.date}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-charcoal">
                    {event.title}
                  </h3>
                  <p className="mt-3 leading-7 text-muted-grey">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
