import type { ReactNode } from "react";

import { portalPreviewMode } from "@/lib/portal/preview";
import { cn } from "@/lib/utils";

type PreviewNoteProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

/**
 * A callout that explains what the preview build does not do yet. It renders
 * nothing once the portal runs against real sessions.
 */
export function PreviewNote({ children, className }: PreviewNoteProps) {
  if (!portalPreviewMode) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-2xl bg-soft-cream p-4 text-sm leading-6 text-muted-grey",
        className,
      )}
    >
      {children}
    </p>
  );
}
