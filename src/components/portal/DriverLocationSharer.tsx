"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation, OctagonX, TriangleAlert } from "lucide-react";

import {
  shareDriverPosition,
  stopSharingPosition,
  type DriverRoute,
} from "@/app/(portal)/portal/actions/driving";
import { cn } from "@/lib/utils";

type DriverLocationSharerProps = {
  readonly routes: readonly DriverRoute[];
};

// The phone reports far more often than the school needs, and every send costs
// the driver battery and data. Sending at most every 20 seconds keeps the
// parent view usefully fresh without draining a phone over a two-hour run.
const MIN_SEND_INTERVAL_MS = 20_000;

// A fix this vague is worse than nothing — it would put the bus in the wrong
// neighbourhood on a parent's screen.
const MAX_USEFUL_ACCURACY_M = 500;

type Status =
  | "idle"
  | "requesting"
  | "sharing"
  | "denied"
  | "unavailable"
  | "error";

export function DriverLocationSharer({ routes }: DriverLocationSharerProps) {
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [sentCount, setSentCount] = useState(0);
  const [detail, setDetail] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSendRef = useRef(0);
  // Held in a ref so the long-lived geolocation callback always sends for the
  // route selected now, not the one captured when sharing started. Synced in
  // an effect rather than during render, which React forbids.
  const routeIdRef = useRef(routeId);
  useEffect(() => {
    routeIdRef.current = routeId;
  }, [routeId]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Sharing must not outlive the page. If the driver closes the tab, the watch
  // goes with it and the parent view ages out to "signal lost" rather than
  // showing a position that stopped being true.
  useEffect(() => stopWatching, [stopWatching]);

  function handlePosition(position: GeolocationPosition) {
    const now = Date.now();
    if (now - lastSendRef.current < MIN_SEND_INTERVAL_MS) return;

    const { latitude, longitude, speed, accuracy } = position.coords;

    if (typeof accuracy === "number" && accuracy > MAX_USEFUL_ACCURACY_M) {
      setDetail(
        `Waiting for a better signal — the last fix was only accurate to about ${Math.round(accuracy)} m.`,
      );
      return;
    }

    lastSendRef.current = now;

    void shareDriverPosition({
      routeId: routeIdRef.current,
      latitude,
      longitude,
      speedKph:
        typeof speed === "number" && speed >= 0 ? speed * 3.6 : undefined,
      accuracyM: typeof accuracy === "number" ? accuracy : undefined,
      recordedAt: new Date(position.timestamp).toISOString(),
    }).then((result) => {
      if (result.ok) {
        setLastSentAt(new Date());
        setSentCount((count) => count + 1);
        setDetail(null);
        return;
      }
      if (result.error === "not_your_route") {
        setStatus("error");
        setDetail("You are not the assigned driver for this route.");
        stopWatching();
        return;
      }
      setDetail("Could not reach the school just now — still trying.");
    });
  }

  function handleError(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      setStatus("denied");
      setDetail(null);
    } else {
      setStatus("error");
      setDetail(
        error.code === error.TIMEOUT
          ? "The phone could not get a location fix. Try somewhere with a clearer view of the sky."
          : "Location is unavailable on this device right now.",
      );
    }
    stopWatching();
  }

  function start() {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    if (!routeId) return;

    setStatus("requesting");
    setDetail(null);
    lastSendRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setStatus("sharing");
        handlePosition(position);
      },
      handleError,
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
    );
  }

  function stop() {
    stopWatching();
    setStatus("idle");
    setDetail(null);
    void stopSharingPosition(routeId);
  }

  const sharing = status === "sharing" || status === "requesting";

  if (routes.length === 0) {
    return (
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        No routes are set up for you yet. The transport office assigns a route
        to your account before you can share the bus location.
      </p>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-soft-white p-4 text-sm leading-6 text-muted-grey">
        <p className="font-bold text-charcoal">What families see</p>
        <p className="mt-1">
          While you are sharing, parents with a child on this route see the
          bus position and how recent it is — nothing else. Your location is not
          recorded when sharing is off, and no history of where you have been is
          kept.
        </p>
      </div>

      <label className="mt-5 block text-sm font-bold text-charcoal">
        Route you are driving
        <select
          value={routeId}
          onChange={(event) => setRouteId(event.target.value)}
          disabled={sharing}
          className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal disabled:opacity-60"
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.busName} · {route.routeName}
              {route.assignedToMe ? "" : " (covering)"}
            </option>
          ))}
        </select>
      </label>

      {sharing ? (
        <button
          type="button"
          onClick={stop}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-base font-bold text-white transition-colors hover:bg-red-700"
        >
          <OctagonX aria-hidden="true" className="size-5" />
          Stop sharing
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={!routeId}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-curry-orange px-6 text-base font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <Navigation aria-hidden="true" className="size-5" />
          Start sharing my location
        </button>
      )}

      {status === "requesting" ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          Waiting for your phone to allow location access…
        </p>
      ) : null}

      {status === "sharing" ? (
        <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
          <p className="flex items-center gap-2 font-bold text-charcoal">
            <MapPin aria-hidden="true" className="size-4 text-emerald-600" />
            Sharing with families
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            {lastSentAt
              ? `Last sent at ${lastSentAt.toLocaleTimeString()} · ${sentCount} update${sentCount === 1 ? "" : "s"} this run.`
              : "Waiting for the first location fix…"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-grey">
            Keep this page open. Sharing stops if you close it.
          </p>
        </div>
      ) : null}

      {status === "denied" ? (
        <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-center gap-2 font-bold text-charcoal">
            <TriangleAlert aria-hidden="true" className="size-4 text-amber-600" />
            Location permission was refused
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-grey">
            Your phone is blocking location for this site. Allow it in your
            browser settings for this page, then tap Start sharing again.
          </p>
        </div>
      ) : null}

      {status === "unavailable" ? (
        <p className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-charcoal">
          This device cannot report a location.
        </p>
      ) : null}

      {detail ? (
        <p
          role="status"
          className={cn(
            "mt-4 rounded-2xl border p-4 text-sm leading-6 font-semibold text-charcoal",
            status === "error"
              ? "border-red-300 bg-red-50"
              : "border-border bg-soft-white",
          )}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}
