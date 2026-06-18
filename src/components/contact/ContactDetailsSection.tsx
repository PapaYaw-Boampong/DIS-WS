import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { contactDetails, contactReasons } from "@/data/contact";
import { routes } from "@/lib/routes";

function DetailAction({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  if (!href) {
    return <span className="text-sm font-bold text-charcoal">{children}</span>;
  }

  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className="text-sm font-bold text-curry-orange hover:text-deep-orange"
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className="text-sm font-bold text-curry-orange hover:text-deep-orange"
    >
      {children}
    </a>
  );
}

export function ContactDetailsSection() {
  return (
    <>
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Reach Us"
            title="Contact details"
            description="Use the details below for admissions, school information, visit planning and future portal support."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactDetails.map((detail) => (
              <article
                key={detail.title}
                className="rounded-card border border-border bg-white p-6 shadow-card"
              >
                <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                  <ContentIcon name={detail.icon} className="size-6" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-charcoal">
                  {detail.title}
                </h2>
                <p className="mt-3 min-h-14 leading-7 text-muted-grey">
                  {detail.description}
                </p>
                <div className="mt-5">
                  <DetailAction href={detail.href}>
                    {detail.value}
                  </DetailAction>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="Visit"
              title="Find us in Accra"
              description="Use the location page for a Google Maps view, visit notes and directions support."
            />
            <Link
              href={routes.location}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-curry-orange px-7 text-sm font-semibold text-white transition-colors hover:bg-deep-orange"
            >
              Open Location Page
            </Link>
          </div>
          <ImagePlaceholder
            label="Map and location preview"
            description="Placeholder preview linking to the Divine International School location page."
            icon="map-pin"
            aspect="landscape"
          />
        </Container>
      </section>

      <section className="pattern-checker py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="How We Can Help"
            title="Choose the right contact pathway"
            description="These common reasons help families and visitors decide where to begin."
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactReasons.map((reason) => (
              <Card
                key={reason.title}
                title={reason.title}
                description={reason.description}
                icon={<ContentIcon name={reason.icon} className="size-6" />}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
