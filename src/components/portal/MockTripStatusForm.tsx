"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { formatTransportStatus } from "@/lib/portal/format";
import type {
  TransportRoute,
  TransportTripStatus,
} from "@/types/portal";

type MockTripStatusFormProps = {
  readonly routes: readonly TransportRoute[];
};

const statuses: readonly TransportTripStatus[] = [
  "not_started",
  "on_route",
  "picked_up",
  "arrived",
  "departed",
  "dropped_off",
  "delayed",
  "cancelled",
];

export function MockTripStatusForm({
  routes,
}: MockTripStatusFormProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const routeId = String(formData.get("route"));
    const status = String(formData.get("status")) as TransportTripStatus;
    const location = String(formData.get("location")).trim();
    const route = routes.find((item) => item.id === routeId);

    if (!route) {
      setPreview("Choose a valid route to preview the update.");
      return;
    }

    setPreview(
      `${route.busName} would be marked ${formatTransportStatus(status)}${location ? ` at ${location}` : ""}. No trip record was changed.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Manual update preview only. Submitting this form does not save status,
        notify families, or call a backend.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Route
          <select
            name="route"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.busName} · {route.routeName}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Trip status
          <select
            name="status"
            defaultValue="on_route"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatTransportStatus(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Current location or note
          <input
            name="location"
            placeholder="Example: American House"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>

        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <RefreshCw aria-hidden="true" className="size-5" />
          Preview status update
        </button>
      </form>

      {preview ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold leading-6 text-charcoal"
        >
          {preview}
        </p>
      ) : null}
    </div>
  );
}
