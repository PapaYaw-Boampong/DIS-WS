"use client";

import { useEffect, useState } from "react";
import { MapPin, Radio, SatelliteDish } from "lucide-react";

import type { TransportTrip } from "@/types/portal";

type LiveBusPositionProps = {
  readonly trip: TransportTrip;
  readonly busName: string;
};

// A reading older than this is stale: the tracker has stopped reporting, and
// showing it as "live" would tell a parent the bus is somewhere it left long
// ago. Better to say the signal was lost.
const STALE_AFTER_MS = 5 * 60 * 1000;

/**
 * Live position, shown only while the driver is sharing it from their phone.
 *
 * A client component on purpose: "updated 2 minutes ago" computed during a
 * server render is frozen at render time and quietly becomes a lie while the
 * parent watches the page. The age is measured in the browser and re-measured
 * every 30 seconds.
 *
 * The schematic route map is a diagram, not a map — real coordinates are given
 * as data with a link to open them in a proper map app, rather than plotted
 * onto a drawing where their position would be a guess.
 */
export function LiveBusPosition({ trip, busName }: LiveBusPositionProps) {
  const hasFix =
    typeof trip.latitude === "number" &&
    typeof trip.longitude === "number" &&
    Boolean(trip.positionAt);

  const recordedAt = trip.positionAt ?? null;
  // null until the browser has measured it, so the server-rendered markup and
  // the first client render agree.
  const [ageMs, setAgeMs] = useState<number | null>(null);

  useEffect(() => {
    if (!recordedAt) return;

    const measure = () =>
      setAgeMs(Date.now() - new Date(recordedAt).getTime());

    measure();
    const timer = setInterval(measure, 30_000);
    return () => clearInterval(timer);
  }, [recordedAt]);

  if (!hasFix) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-soft-white p-4">
        <MapPin
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-muted-grey"
        />
        <div>
          <p className="font-bold text-charcoal">
            The driver is not sharing location right now
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            Live position appears here once the driver starts the run and
            shares it from their phone. Until then, the stops and times shown
            are the route&apos;s schedule.
          </p>
        </div>
      </div>
    );
  }

  const stale = ageMs !== null && ageMs > STALE_AFTER_MS;
  const minutes = ageMs === null ? null : Math.max(0, Math.round(ageMs / 60000));
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${trip.latitude},${trip.longitude}`;

  function freshness(): string {
    if (minutes === null) return "Checking how recent this reading is…";
    if (stale) {
      return `The last position was ${minutes} minute${minutes === 1 ? "" : "s"} ago — the driver may have ended the run or lost signal. The bus has moved since then.`;
    }
    const when =
      minutes === 0
        ? "Updated just now."
        : `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago.`;
    const speed =
      typeof trip.speedKph === "number" && trip.speedKph > 1
        ? ` Travelling at about ${Math.round(trip.speedKph)} km/h.`
        : "";
    // Say so when the fix is rough, rather than presenting a wide reading as
    // an exact spot on the road.
    const precision =
      typeof trip.accuracyM === "number" && trip.accuracyM > 100
        ? ` Accurate to about ${Math.round(trip.accuracyM)} m.`
        : "";
    return `${when}${speed}${precision}`;
  }

  return (
    <div
      className={
        stale
          ? "flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4"
          : "flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4"
      }
    >
      {stale ? (
        <SatelliteDish
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-amber-600"
        />
      ) : (
        <Radio
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-emerald-600"
        />
      )}
      <div className="min-w-0">
        <p className="font-bold text-charcoal">
          {stale
            ? "Location sharing has stopped"
            : `${busName} is sharing its position`}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-grey">{freshness()}</p>
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
        >
          <MapPin aria-hidden="true" className="size-4" />
          Open on a map
        </a>
      </div>
    </div>
  );
}
