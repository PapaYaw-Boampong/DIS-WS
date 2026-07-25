"use client";

import { useState } from "react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { aboutValues, coreValues } from "@/data/about";
import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "mission",
    label: "Our Mission",
    icon: aboutValues[0].icon,
    description: aboutValues[0].description,
    backgroundImage: aboutValues[0].image,
  },
  {
    id: "vision",
    label: "Our Vision",
    icon: aboutValues[1].icon,
    description: aboutValues[1].description,
    backgroundImage: aboutValues[1].image,
  },
  {
    id: "values",
    label: "Our Values",
    icon: "heart",
    description:
      "Faith, integrity, respect, excellence, responsibility and service shape how our community learns, works and treats one another every day.",
    backgroundImage: siteImages.aboutCommunity,
  },
] as const;

export function MissionVisionValues() {
  const [activeId, setActiveId] = useState<(typeof tabs)[number]["id"]>(
    tabs[0].id,
  );
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
      {/* The selected principle's photo IS the section background; it cross-fades
          as the selection changes. No checker is merged over it, and the content
          card carries only text + infographic (never a duplicate of the photo). */}
      <div aria-hidden="true" className="absolute inset-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out motion-reduce:transition-none",
              tab.id === activeId ? "opacity-100" : "opacity-0",
            )}
            style={{ backgroundImage: `url(${tab.backgroundImage.src.src})` }}
          />
        ))}
        {/* Light wash for legibility of the header and cards over the photo. */}
        <div className="absolute inset-0 bg-white/55" />
      </div>

      <Container className="relative">
        <SectionHeader
          eyebrow="Our Foundation"
          title="Mission, vision and values"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:gap-10">
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
                    "flex items-center gap-4 rounded-card border p-5 text-left transition-all duration-200",
                    isActive
                      ? "-translate-y-0.5 border-curry-orange bg-white shadow-card-strong"
                      : "mvv-breath border-border bg-white/85 backdrop-blur-sm hover:border-curry-orange/60 hover:bg-white hover:shadow-card",
                  )}
                  onClick={() => setActiveId(tab.id)}
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
                      isActive
                        ? "bg-curry-orange text-white"
                        : "bg-soft-cream text-curry-orange",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-center gap-2">
                    <ContentIcon
                      name={tab.icon}
                      className="size-5 text-curry-orange"
                    />
                    <span className="text-lg font-bold text-charcoal">
                      {tab.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`mvv-panel-${active.id}`}
            aria-labelledby={`mvv-tab-${active.id}`}
            className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8"
          >
            <h3 className="font-display text-2xl font-semibold text-charcoal sm:text-3xl">
              {active.label}
            </h3>
            <p className="mt-4 text-lg leading-8 text-muted-grey">
              {active.description}
            </p>
            {active.id === "values" ? (
              <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                {coreValues.map((value) => (
                  <li key={value.label} className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                      <ContentIcon name={value.icon} className="size-6" />
                    </span>
                    <span className="font-bold text-charcoal">
                      {value.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
