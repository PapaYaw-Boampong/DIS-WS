import { Bus, MapPin } from "lucide-react";

import type { TransportRoute, TransportTrip } from "@/types/portal";

type TransportMapPreviewProps = {
  readonly route: TransportRoute;
  readonly trip: TransportTrip;
};

function fallbackStopCoordinates(route: TransportRoute) {
  return route.stops.map((stop, index) => {
    const progress =
      route.stops.length > 1 ? index / (route.stops.length - 1) : 0;

    return {
      label: stop,
      x: 16 + progress * 68,
      y: 74 - progress * 50,
    };
  });
}

export function TransportMapPreview({
  route,
  trip,
}: TransportMapPreviewProps) {
  const stops = route.stopCoordinates?.length
    ? route.stopCoordinates
    : fallbackStopCoordinates(route);
  const busPoint =
    trip.currentLocationPoint ??
    stops.find((stop) => stop.label === trip.currentLocationLabel) ??
    stops[0];
  const polylinePoints = stops.map((stop) => `${stop.x},${stop.y}`).join(" ");

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      <div className="relative min-h-[22rem] bg-[linear-gradient(135deg,#fff6e7_0%,#fffbf3_45%,#eef6ff_100%)]">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(31,41,51,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(31,41,51,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgba(180,83,9,0.42)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 4"
          />
        </svg>

        {stops.map((stop, index) => (
          <div
            key={stop.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-curry-orange shadow-card ring-2 ring-curry-orange/25">
                <MapPin aria-hidden="true" className="size-4" />
              </span>
              <span className="max-w-28 rounded-full bg-white/95 px-3 py-1 text-center text-[0.68rem] font-bold text-charcoal shadow-sm">
                {index + 1}. {stop.label}
              </span>
            </div>
          </div>
        ))}

        {busPoint ? (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${busPoint.x}%`, top: `${busPoint.y}%` }}
          >
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-curry-orange text-white shadow-card-strong ring-4 ring-white">
              <span className="absolute -inset-2 rounded-3xl bg-curry-orange/20" />
              <Bus aria-hidden="true" className="relative size-7" />
            </div>
          </div>
        ) : null}

        <div className="absolute right-4 bottom-4 left-4 rounded-2xl bg-white/95 p-4 shadow-card backdrop-blur">
          <p className="text-xs font-bold tracking-[0.12em] text-curry-orange uppercase">
            Map-style live tracking mock
          </p>
          <p className="mt-2 text-sm font-bold text-charcoal">
            {route.busName} is at {trip.currentLocationLabel ?? "last known stop"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-grey">
            This preview uses mock coordinates. Production live tracking needs a
            backend GPS feed and a map/location provider.
          </p>
        </div>
      </div>
    </div>
  );
}
