import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type CardProps = {
  title: string;
  description: string;
  href?: string;
  icon?: ReactNode;
  image?: SiteImage;
  label?: string;
  className?: string;
};

export function Card({
  title,
  description,
  href,
  icon,
  image,
  label = "Learn more",
  className,
}: CardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card",
        className,
      )}
    >
      {image ? (
        <div className="relative aspect-[16/10] bg-soft-cream">
          <ResponsiveImage
            image={image}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        {icon ? (
          <div
            className={cn(
              "flex items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange",
              image ? "mb-4 size-10" : "mb-5 size-12",
            )}
          >
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
      </div>
    </article>
  );
}
