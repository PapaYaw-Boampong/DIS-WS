import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PatternSectionProps = HTMLAttributes<HTMLElement>;

export function PatternSection({
  className,
  ...props
}: PatternSectionProps) {
  return (
    <section
      className={cn("pattern-checker py-16 sm:py-20 lg:py-24", className)}
      {...props}
    />
  );
}
