"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { cn } from "@/lib/utils";
import type { PortalItem, PortalNotice } from "@/types/content";

type PortalAccessCardsProps = {
  items: readonly PortalItem[];
  notice: PortalNotice;
};

export function PortalAccessCards({
  items,
  notice,
}: PortalAccessCardsProps) {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.title}
            className={cn(
              "flex min-h-[330px] flex-col rounded-card border border-border bg-white p-6 shadow-card",
              index === 1 && "lg:translate-y-20",
              index === 2 && "lg:translate-y-0",
              index === 3 && "lg:col-start-2 lg:translate-y-12",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
              <ContentIcon name={item.icon} className="size-6" />
            </div>
            <p className="mt-6 text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
              {item.audience} - {item.status}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-charcoal">
              {item.title}
            </h3>
            <p className="mt-4 flex-1 leading-7 text-muted-grey">
              {item.description}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-charcoal">
              {item.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-curry-orange" aria-hidden="true">
                    *
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              onClick={() => setSelectedPortal(item.title)}
              ariaLabel={`${item.actionLabel} coming soon`}
            >
              {item.actionLabel}
            </Button>
          </article>
        ))}
      </div>

      {selectedPortal ? (
        <div
          role="status"
          className="mt-16 flex gap-3 rounded-card border border-curry-orange/25 bg-soft-cream p-5 text-charcoal"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-curry-orange"
          />
          <div>
            <p className="font-bold">
              {selectedPortal}: {notice.title}
            </p>
            <p className="mt-2 leading-7 text-muted-grey">
              {notice.description}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
