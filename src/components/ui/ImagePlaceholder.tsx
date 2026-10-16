import { ContentIcon } from "@/components/ui/ContentIcon";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type {
  ContentIcon as ContentIconName,
  SiteImage,
} from "@/types/content";

export type ImagePlaceholderProps = {
  label: string;
  description: string;
  icon?: ContentIconName;
  aspect?: "landscape" | "portrait" | "square";
  image?: SiteImage;
  // An admin-uploaded image (portal CMS); used only when `image` is absent.
  imageUrl?: string;
  imageAlt?: string;
  sizes?: string;
  preload?: boolean;
  className?: string;
};

const aspectClasses = {
  landscape: "min-h-[340px] sm:min-h-[440px] lg:min-h-[520px]",
  portrait: "min-h-[460px] sm:min-h-[580px]",
  square: "aspect-square",
} as const;

export function ImagePlaceholder({
  label,
  description,
  icon = "school",
  aspect = "landscape",
  image,
  imageUrl,
  imageAlt,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  preload = false,
  className,
}: ImagePlaceholderProps) {
  const hasImage = Boolean(image || imageUrl);
  return (
    <div
      role={hasImage ? undefined : "img"}
      aria-label={hasImage ? undefined : description}
      className={cn(
        "pattern-checker relative flex items-center justify-center overflow-hidden rounded-[1.75rem] border border-curry-orange/10",
        aspectClasses[aspect],
        className,
      )}
    >
      {image ? (
        <ResponsiveImage
          image={image}
          sizes={sizes}
          preload={preload}
        />
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageAlt ?? description}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <>
          <div
            className="absolute -top-16 -right-16 size-52 rounded-full bg-curry-orange/10"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -left-20 size-64 rounded-full bg-curry/10"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-4 px-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-[1.5rem] bg-white text-curry-orange shadow-card">
              <ContentIcon name={icon} className="size-9" />
            </div>
            <span className="max-w-xs text-sm font-semibold text-charcoal/70">
              {label}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
