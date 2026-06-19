import { ExternalLink } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  locationPoints,
  mapEmbed,
  visitNotes,
} from "@/data/location";

export function LocationMapSection() {
  return (
    <>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Location"
              title="School location and map"
              description="Use the embedded Google Map as a guide and confirm exact visit arrangements with the school before travel."
            />
            <div className="mt-8 grid gap-4">
              {locationPoints.map((point) => (
                <article
                  key={point.title}
                  className="rounded-card border border-border bg-white p-5 shadow-card"
                >
                  <div className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                      <ContentIcon name={point.icon} className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-charcoal">
                        {point.title}
                      </h2>
                      <p className="mt-1 font-semibold text-curry-orange">
                        {point.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-grey">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border bg-soft-cream shadow-card">
            <iframe
              title={mapEmbed.title}
              src={mapEmbed.src}
              className="h-[420px] w-full border-0 sm:h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="border-t border-border bg-white p-5">
              <a
                href={mapEmbed.externalHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-curry-orange transition-colors hover:text-deep-orange"
              >
                Open in Google Maps
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <section className="pattern-checker py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Visit Notes"
            title="Before you come to campus"
            description="These notes help families and visitors plan a useful school visit."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {visitNotes.map((note) => (
              <article
                key={note.title}
                className="rounded-card border border-border bg-white p-6 shadow-card"
              >
                <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                  <ContentIcon name={note.icon} className="size-6" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-charcoal">
                  {note.title}
                </h2>
                <p className="mt-3 leading-7 text-muted-grey">
                  {note.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
