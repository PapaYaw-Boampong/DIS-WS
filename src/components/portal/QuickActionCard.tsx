import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type QuickActionCardProps = {
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
  readonly href?: string;
  readonly phase?: number;
};

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  phase,
}: QuickActionCardProps) {
  const content = (
    <>
      <div className="flex size-11 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-charcoal">{title}</h3>
          {href ? (
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 shrink-0 text-curry-orange"
            />
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-grey">{description}</p>
        {!href && phase ? (
          <p className="mt-2 text-xs font-bold tracking-wide text-deep-orange uppercase">
            Planned for Phase {phase}
          </p>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-h-32 gap-4 rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-curry-orange/40 hover:shadow-card"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex min-h-32 gap-4 rounded-2xl border border-border bg-white p-5 opacity-80">
      {content}
    </div>
  );
}
