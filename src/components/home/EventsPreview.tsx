import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { featuredEvents } from "@/data/events";
import { routes } from "@/lib/routes";

export function EventsPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Events" title="Upcoming Events" />
        <div className="mt-12 space-y-6">
          {featuredEvents.map((event) => (
            <article
              key={event.title}
              className="grid min-h-[300px] gap-8 rounded-card border border-border bg-white p-7 shadow-card sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12"
            >
              <div className="max-w-2xl">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                  <ContentIcon name={event.icon} className="size-7" />
                </div>
                <p className="mt-6 text-sm font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                  {event.date}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-charcoal sm:text-3xl">
                  {event.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-muted-grey sm:text-lg">
                  {event.description}
                </p>
                <Link
                  href={event.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
                >
                  View Calendar
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
              <Button
                href={routes.calendar}
                size="lg"
                className="w-full lg:w-auto"
              >
                View Our Calendar
              </Button>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
