import type { ReactNode } from "react";

type MetricCardProps = {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon?: ReactNode;
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
}: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-grey">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-charcoal">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-sm font-medium text-deep-orange">{detail}</p>
    </article>
  );
}
