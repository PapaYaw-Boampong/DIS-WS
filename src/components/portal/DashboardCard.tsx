import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardCardProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly action?: ReactNode;
};

export function DashboardCard({
  title,
  description,
  children,
  className,
  action,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-white p-6 shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-grey">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
