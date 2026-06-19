import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CardProps = {
  title: string;
  description: string;
  href?: string;
  icon?: ReactNode;
  label?: string;
  className?: string;
};

export function Card({
  title,
  description,
  href,
  icon,
  label = "Learn more",
  className,
}: CardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-card border border-border bg-white p-6 shadow-card",
        className,
      )}
    >
      {icon ? (
        <div className="mb-5 flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
          {icon}
        </div>
      ) : null}
      <h3 className="text-xl font-bold text-charcoal">{title}</h3>
      <p className="mt-3 flex-1 leading-7 text-muted-grey">{description}</p>
      {href ? (
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
        >
          {label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </article>
  );
}
