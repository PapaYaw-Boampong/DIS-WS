"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

type MockTransportPreferenceFormProps = {
  readonly stops: readonly string[];
  readonly defaultPickup: string;
  readonly defaultDropOff: string;
};

export function MockTransportPreferenceForm({
  stops,
  defaultPickup,
  defaultDropOff,
}: MockTransportPreferenceFormProps) {
  const [pickup, setPickup] = useState(defaultPickup);
  const [dropOff, setDropOff] = useState(defaultDropOff);
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      `Pickup set to ${pickup} and drop-off set to ${dropOff} for this local preview. The transport office and backend approval flow are still required.`,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Parent pickup and drop-off changes are local-only in this phase. No
        transport assignment, route record, notification, or audit log is
        written.
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-charcoal">
          Pickup point
          <select
            value={pickup}
            onChange={(event) => setPickup(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            {stops.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-charcoal">
          Drop-off point
          <select
            value={dropOff}
            onChange={(event) => setDropOff(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            {stops.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
      >
        <MapPin aria-hidden="true" className="size-5" />
        Save pickup/drop-off preference
      </button>

      {status ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold leading-6 text-charcoal"
        >
          {status}
        </p>
      ) : null}
    </form>
  );
}
