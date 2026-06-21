import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type {
  ContentIcon as ContentIconName,
  SiteImage,
} from "@/types/content";

type CarouselCardProps = {
  title: string;
  description: string;
  eyebrow?: string;
  icon: ContentIconName;
  image?: SiteImage;
  imageDescription?: string;
  className?: string;
};

export function CarouselCard({
  title,
  description,
  eyebrow,
  icon,
  image,
  imageDescription,
  className,
}: CarouselCardProps) {
  return (
    <article
      className={cn(
        "flex h-full min-h-[300px] flex-col overflow-hidden rounded-card border border-border bg-white shadow-card",
        className,
      )}
    >
      {image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-soft-cream">
          <ResponsiveImage
            image={image}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 38vw, 75vw"
          />
        </div>
      ) : imageDescription ? (
        <div
          role="img"
          aria-label={imageDescription}
          className="pattern-checker flex aspect-[4/3] items-center justify-center border-b border-border"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-card">
            <ContentIcon name={icon} className="size-8" />
          </div>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        {!image && !imageDescription ? (
          <div className="mb-5 flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
            <ContentIcon name={icon} className="size-6" />
          </div>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h3 className={cn("text-xl font-bold text-charcoal", eyebrow && "mt-2")}>
          {title}
        </h3>
        <p className="mt-3 flex-1 leading-7 text-muted-grey">{description}</p>
      </div>
    </article>
  );
}
