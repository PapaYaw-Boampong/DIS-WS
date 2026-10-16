"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";

import { updateTripStatus } from "@/app/(portal)/portal/actions/school";
import { formatTransportStatus } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import type { TransportRoute, TransportTripStatus } from "@/types/portal";

type TripStatusFormProps = {
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

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

/**
 * The operator's manual position update for a running trip. Notifying families
 * is opt-in per update: a ping on every status change would train parents to
 * ignore transport notifications entirely.
 */
export function TripStatusForm({ routes }: TripStatusFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateTripStatus({
        routeId: String(formData.get("route") ?? ""),
        status: String(formData.get("status") ?? "on_route"),
        nextStop: String(formData.get("location") ?? "").trim(),
        notifyParents: formData.get("notify") === "on",
      });

      setFailed(!result.ok);
      setMessage(result.message);
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Route
          <select name="route" className={fieldClass}>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.busName} · {route.routeName}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Trip status
          <select name="status" defaultValue="on_route" className={fieldClass}>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatTransportStatus(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold text-charcoal">
          Current location or next stop
          <input
            name="location"
            placeholder="Example: American House"
            className={fieldClass}
          />
        </label>

        <label className="flex items-center gap-3 text-sm font-bold text-charcoal">
          <input
            type="checkbox"
            name="notify"
            className="size-5 shrink-0 accent-[var(--color-curry-orange,#e07a1f)]"
          />
          Notify families on this route
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <RefreshCw aria-hidden="true" className="size-5" />
          {pending ? "Saving…" : "Save status update"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm font-semibold leading-6 text-charcoal",
            failed ? "border-red-300 bg-red-50" : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
