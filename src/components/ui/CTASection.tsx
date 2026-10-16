import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import type { SiteImage } from "@/types/content";

type CTASectionProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  // Optional faded photograph behind the band. Purely decorative: it is
  // hidden from assistive technology and kept dim so text contrast holds.
  backgroundImage?: SiteImage;
};

export function CTASection({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  backgroundImage,
}: CTASectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal py-16 text-white sm:py-20">
      {backgroundImage ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute inset-0 opacity-30">
            <ResponsiveImage image={backgroundImage} sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/50" />
        </div>
      ) : null}
      <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-3xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-soft-white">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button href={primaryHref}>{primaryLabel}</Button>
          {secondaryLabel && secondaryHref ? (
            <Button href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
