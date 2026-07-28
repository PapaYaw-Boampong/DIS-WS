import { Container } from "@/components/ui/Container";
import { HeroImageRotator } from "@/components/ui/HeroImageRotator";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  image?: SiteImage;
  images?: readonly SiteImage[];
  preloadImage?: boolean;
  variant?: "light" | "dark" | "orange" | "pattern";
  align?: "left" | "center";
  size?: "default" | "spacious";
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  images,
  preloadImage = false,
  variant = "light",
  align = "left",
  size = "default",
}: PageHeroProps) {
  const heroImages =
    images && images.length > 0 ? images : image ? [image] : [];
  const hasImage = heroImages.length > 0;
  const isDark = variant === "dark" || hasImage;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        size === "default" &&
          "pt-[calc(var(--header-h)+5rem)] pb-20 sm:pt-[calc(var(--header-h)+6rem)] sm:pb-24 lg:pt-[calc(var(--header-h)+8rem)] lg:pb-32",
        size === "spacious" &&
          "pt-[calc(var(--header-h)+7rem)] pb-28 sm:pt-[calc(var(--header-h)+9rem)] sm:pb-36 lg:pt-[calc(var(--header-h)+12rem)] lg:pb-48",
        variant === "light" && "bg-soft-white",
        // variant === "dark" && "bg-charcoal",
        variant === "orange" && "bg-curry-orange",
        variant === "pattern" && "pattern-checker",
      )}
    >
      {variant === "orange" ? (
        <>
          <div
            className="absolute -right-28 -bottom-40 -z-10 size-[440px] rounded-full border-[76px] border-white/5"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.11),transparent_30%)]"
            aria-hidden="true"
          />
        </>
      ) : null}
      {hasImage ? (
        <>
          {heroImages.length > 1 ? (
            <HeroImageRotator images={heroImages} preload={preloadImage} />
          ) : (
            <ResponsiveImage
              image={heroImages[0]}
              sizes="100vw"
              preload={preloadImage}
              className="absolute inset-0 -z-20 object-cover"
            />
          )}
          <div
            className="absolute inset-0 -z-20 bg-charcoal/75"
            aria-hidden="true"
          />
        </>
      ) : null}
      <Container>
        <div
          className={cn(
            "max-w-4xl",
            align === "center" && "mx-auto text-center",
          )}
        >
          {eyebrow ? (
            <p className="mb-4 text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "font-display text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl lg:text-6xl",
              isDark || variant === "orange" ? "text-white" : "text-charcoal",
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-6 max-w-2xl text-lg leading-8 sm:text-xl",
              align === "center" && "mx-auto",
              isDark || variant === "orange"
                ? "text-soft-white"
                : "text-muted-grey",
            )}
          >
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
