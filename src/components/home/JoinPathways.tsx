import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { homePathways } from "@/data/home";

export function JoinPathways() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeader eyebrow="Pathways" title="Join Divine as..." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {homePathways.map((pathway) => (
            <article
              key={pathway.title}
              className="group flex min-h-[290px] flex-col rounded-card border border-border bg-white p-8 shadow-card transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <ContentIcon name={pathway.icon} className="size-7" />
              </div>
              <h3 className="mt-7 text-2xl font-bold text-charcoal">
                {pathway.title}
              </h3>
              <p className="mt-3 flex-1 leading-7 text-muted-grey">
                {pathway.description}
              </p>
              <Link
                href={pathway.href}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
              >
                Get Started
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
