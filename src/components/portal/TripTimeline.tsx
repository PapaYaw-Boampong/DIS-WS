import { Check, MapPin } from "lucide-react";

import { formatTransportStatus } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import type { TransportTripStatus } from "@/types/portal";

type TripTimelineProps = {
  readonly status: TransportTripStatus;
};

const morningSteps = [
  { status: "not_started", label: "Trip prepared" },
  { status: "on_route", label: "Bus on route" },
  { status: "picked_up", label: "Student picked up" },
  { status: "arrived", label: "Arrived at school" },
] as const;

export function TripTimeline({ status }: TripTimelineProps) {
  const currentIndex = morningSteps.findIndex((step) => step.status === status);
  const exceptionalStatus = status === "delayed" || status === "cancelled";
  const effectiveIndex = exceptionalStatus ? 1 : currentIndex;

  return (
    <ol className="space-y-0" aria-label="Morning transport trip progress">
      {morningSteps.map((step, index) => {
        const complete = index < effectiveIndex;
        const current = index === effectiveIndex;

        return (
          <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
            {index < morningSteps.length - 1 ? (
              <span
                className={cn(
                  "absolute top-8 left-[0.9375rem] h-[calc(100%-1.5rem)] w-px",
                  complete ? "bg-emerald-400" : "bg-border",
                )}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-white",
                complete && "border-emerald-500 text-emerald-600",
                current && "border-curry-orange text-curry-orange",
                !complete && !current && "border-border text-muted-grey",
              )}
            >
              {complete ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <MapPin aria-hidden="true" className="size-4" />
              )}
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-bold",
                  current ? "text-deep-orange" : "text-charcoal",
                )}
              >
                {step.label}
              </p>
              {current && exceptionalStatus ? (
                <p className="mt-1 text-xs text-muted-grey">
                  Current trip status: {formatTransportStatus(status)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
