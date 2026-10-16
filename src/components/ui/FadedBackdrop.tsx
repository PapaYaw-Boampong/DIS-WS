import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import type { SiteImage } from "@/types/content";

type FadedBackdropProps = {
  image: SiteImage;
};

/**
 * A dim photograph that fades out towards the bottom of a section, used in
 * place of the checked pattern. Decorative only: hidden from assistive technology
 * and kept faint so text and cards above it keep their contrast. The parent
 * section must be `relative isolate overflow-hidden`.
 */
export function FadedBackdrop({ image }: FadedBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_90%)]"
    >
      <ResponsiveImage image={image} sizes="100vw" />
    </div>
  );
}
