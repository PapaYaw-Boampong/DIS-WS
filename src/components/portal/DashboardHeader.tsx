import type { ReactNode } from "react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import { portalPreviewMode, previewText } from "@/lib/portal/preview";

type DashboardHeaderProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
  readonly action?: ReactNode;
};

export function DashboardHeader({
  eyebrow,
  title,
  description,
  badge = "Mock data",
  action,
}: DashboardHeaderProps) {
  // Badges label the preview build ("Mock LMS", "Manual status data"); outside
  // the preview they are development noise, so only the action renders.
  const copy = previewText(description);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold tracking-[0.14em] text-curry-orange uppercase">
          {eyebrow}
        </p>
        <h1 className="portal-title-bounce mt-2 text-3xl font-extrabold tracking-[-0.04em] text-charcoal sm:text-4xl">
          {title}
        </h1>
        {copy ? (
          <p className="mt-3 max-w-2xl leading-7 text-muted-grey">{copy}</p>
        ) : null}
      </div>
      {action || portalPreviewMode ? (
        <div className="flex flex-wrap items-center gap-3">
          {action}
          {portalPreviewMode ? (
            <StatusBadge variant="info">{badge}</StatusBadge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
