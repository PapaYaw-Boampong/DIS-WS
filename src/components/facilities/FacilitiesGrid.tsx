"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { FacilityModal } from "@/components/facilities/FacilityModal";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";
import type { FacilityItem } from "@/types/content";

type FacilitiesGridProps = {
  eyebrow: string;
  title: string;
  description?: string;
  items: readonly FacilityItem[];
  background?: "white" | "soft-white";
};

export function FacilitiesGrid({
  eyebrow,
  title,
  description,
  items,
  background = "white",
}: FacilitiesGridProps) {
  const [active, setActive] = useState<FacilityItem | null>(null);

  return (
    <section
      className={cn(
        "py-20 sm:py-24 lg:py-28",
        background === "white" ? "bg-white" : "bg-soft-white",
      )}
    >
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActive(item)}
              className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white text-left shadow-card transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-card-strong"
            >
              <div className="relative">
                {item.image ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-soft-cream">
                    <ResponsiveImage
                      image={item.image}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : (
                  <div
                    role="img"
                    aria-label={`${item.title} at Divine International School`}
                    className="pattern-checker flex aspect-[4/3] items-center justify-center border-b border-border"
                  >
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-card">
                      <ContentIcon name={item.icon} className="size-8" />
                    </div>
                  </div>
                )}
                {item.status === "planned" ? (
                  <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold tracking-wide text-deep-orange uppercase shadow-card">
                    Planned
                  </span>
                ) : null}
                <span className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-card backdrop-blur transition-colors group-hover:bg-curry-orange group-hover:text-white">
                  <ArrowUpRight aria-hidden="true" className="size-5" />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-charcoal">{item.title}</h3>
                <p className="mt-3 flex-1 leading-7 text-muted-grey">
                  {item.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange">
                  {item.gallery && item.gallery.length > 0
                    ? "View gallery"
                    : "View details"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Container>

      {active ? (
        <FacilityModal facility={active} onClose={() => setActive(null)} />
      ) : null}
    </section>
  );
}
