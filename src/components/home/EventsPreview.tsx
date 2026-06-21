import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { featuredEvents } from "@/data/events";

export function EventsPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Events" title="Upcoming Events" />
        <div className="mt-12 space-y-6">
          {featuredEvents.map((event) => (
            <article
              key={event.title}
              className="grid min-h-[340px] overflow-hidden rounded-card border border-border bg-white shadow-card lg:grid-cols-[0.8fr_1.2fr]"
            >
              {event.image ? (
                <div className="relative min-h-64 bg-soft-cream lg:min-h-full">
                  <ResponsiveImage
                    image={event.image}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                </div>
              ) : null}
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
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
                  {event.actionLabel ?? "View Calendar"}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Button
                  href={event.href}
                  size="lg"
                  className="mt-7 w-full sm:w-fit"
                >
                  {event.actionLabel ?? "View Our Calendar"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
