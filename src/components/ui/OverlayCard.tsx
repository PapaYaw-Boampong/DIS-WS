import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type {
  ContentIcon as ContentIconName,
  SiteImage,
} from "@/types/content";

type OverlayCardProps = {
  title: string;
  image: SiteImage;
  href?: string;
  eyebrow?: string;
  icon?: ContentIconName;
  cta?: string;
  aspect?: "portrait" | "landscape" | "square";
  sizes?: string;
  className?: string;
};

const aspectClasses = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

// Image-led card: a full-bleed photo with a dark gradient and minimal overlaid
// text. Whole card is a link when `href` is set.
export function OverlayCard({
  title,
  image,
  href,
  eyebrow,
  icon,
  cta,
  aspect = "portrait",
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  className,
}: OverlayCardProps) {
  const base = cn(
    "group relative block overflow-hidden rounded-card border border-curry-orange/10 shadow-card",
    aspectClasses[aspect],
    className,
  );

  const content = (
    <>
      <div className="absolute inset-0 transition-transform duration-[600ms] ease-out group-hover:scale-[1.07] motion-reduce:transform-none">
        <ResponsiveImage image={image} sizes={sizes} />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-charcoal/92 via-charcoal/45 to-charcoal/10"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 p-6">
        {icon ? (
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
            <ContentIcon name={icon} className="size-5" />
          </div>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-extrabold tracking-[0.16em] text-white/80 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 font-display text-2xl font-semibold text-white">
          {title}
        </h3>
        {cta ? (
          <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
            {cta}
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-2.5 hover:shadow-card-strong focus-visible:-translate-y-2.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={base}>{content}</div>;
}
