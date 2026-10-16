import type { HTMLAttributes } from "react";

import { FadedBackdrop } from "@/components/ui/FadedBackdrop";
import { cn } from "@/lib/utils";
import type { SiteImage } from "@/types/content";

type PatternSectionProps = HTMLAttributes<HTMLElement> & {
  backgroundImage?: SiteImage;
};

export function PatternSection({
  className,
  backgroundImage,
  children,
  ...props
}: PatternSectionProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-20 lg:py-24",
        // A faded photograph replaces the checker pattern rather than
        // sitting on top of it.
        backgroundImage ? "bg-white" : "pattern-checker",
        className,
      )}
      {...props}
    >
      {backgroundImage ? <FadedBackdrop image={backgroundImage} /> : null}
      {children}
    </section>
  );
}
