import { Button } from "@/components/ui/Button";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { cn } from "@/lib/utils";
import type { PortalItem } from "@/types/content";

type PortalAccessCardsProps = {
  items: readonly PortalItem[];
};

export function PortalAccessCards({
  items,
}: PortalAccessCardsProps) {
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
              href={item.href}
              variant="secondary"
              className="mt-6"
              ariaLabel={`${item.actionLabel} mock preview`}
            >
              {item.actionLabel}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
