"use client";

import { useState } from "react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutValues, coreValues } from "@/data/about";
import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

const tabs = [
  {
    id: "mission",
    label: "Our Mission",
    icon: aboutValues[0].icon,
    description: aboutValues[0].description,
    image: aboutValues[0].image,
  },
  {
    id: "vision",
    label: "Our Vision",
    icon: aboutValues[1].icon,
    description: aboutValues[1].description,
    image: aboutValues[1].image,
  },
  {
    id: "values",
    label: "Our Values",
    icon: "heart",
    description:
      "Faith, integrity, respect, excellence, responsibility and service shape how our community learns, works and treats one another every day.",
    image: siteImages.mvvValues,
  },
] as const satisfies readonly {
  id: string;
  label: string;
  icon: string;
  description: string;
  image: SiteImage;
}[];

export function MissionVisionValues() {
  const [activeId, setActiveId] = useState<(typeof tabs)[number]["id"]>(
    tabs[0].id,
  );
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <section className="bg-soft-cream py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Our Foundation"
          title="Mission, vision and values"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:gap-10">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Mission, vision and values"
            className="flex flex-col gap-3"
          >
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeId;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`mvv-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`mvv-panel-${tab.id}`}
                  className={cn(
                    "flex items-center gap-4 rounded-card border bg-white p-3 pr-5 text-left transition-all duration-200",
                    isActive
                      ? "-translate-y-0.5 border-curry-orange shadow-card-strong"
                      : "mvv-breath border-border hover:border-curry-orange/60 hover:shadow-card",
                  )}
                  onClick={() => setActiveId(tab.id)}
                >
                  <span
                    className={cn(
                      "relative size-20 shrink-0 overflow-hidden rounded-2xl transition-[box-shadow] duration-200",
                      isActive && "ring-4 ring-curry-orange/25",
                    )}
                  >
                    <ResponsiveImage image={tab.image} sizes="80px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-extrabold tracking-[0.16em] text-curry-orange">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <ContentIcon
                        name={tab.icon}
                        className="size-5 shrink-0 text-curry-orange"
                      />
                      <span className="text-lg font-bold text-charcoal">
                        {tab.label}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <article
            role="tabpanel"
            id={`mvv-panel-${active.id}`}
            aria-labelledby={`mvv-tab-${active.id}`}
            className="overflow-hidden rounded-card border border-border bg-white shadow-card-strong"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-soft-cream">
              {/* All three photos stay mounted so switching cross-fades. */}
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  aria-hidden={tab.id !== activeId || undefined}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                    tab.id === activeId ? "opacity-100" : "opacity-0",
                  )}
                >
                  <ResponsiveImage
                    image={tab.image}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                  />
                </div>
              ))}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-6 sm:p-8">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-curry-orange text-white">
                  <ContentIcon name={active.icon} className="size-6" />
                </span>
                <h3 className="font-display text-3xl font-semibold text-white sm:text-4xl">
                  {active.label}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="border-l-4 border-curry-orange pl-5 text-lg leading-8 text-charcoal sm:text-xl sm:leading-9">
                {active.description}
              </p>
              {active.id === "values" ? (
                <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {coreValues.map((value) => (
                    <li
                      key={value.label}
                      className="flex items-center gap-3 rounded-2xl bg-soft-cream px-4 py-3"
                    >
                      <ContentIcon
                        name={value.icon}
                        className="size-5 shrink-0 text-curry-orange"
                      />
                      <span className="font-bold text-charcoal">
                        {value.label}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
