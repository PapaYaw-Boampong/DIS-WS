"use client";

import { useState } from "react";
import { CalendarDays, Clock3, MapPin, Phone } from "lucide-react";

import { formatPortalDate, formatPortalTime } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import type { PortalEvent, PortalEventCategory } from "@/types/portal";

type EventsTabsProps = {
  readonly events: readonly PortalEvent[];
};

const categoryLabels: Record<PortalEventCategory, string> = {
  academic: "Academic",
  community: "Community",
  sports: "Sports",
  meeting: "Meetings",
};

const categoryOrder: readonly PortalEventCategory[] = [
  "academic",
  "meeting",
  "sports",
  "community",
];

function eventWindow(event: PortalEvent) {
  if (!event.time) {
    return "Time to be confirmed";
  }

  return event.endTime
    ? `${formatPortalTime(event.time)} – ${formatPortalTime(event.endTime)}`
    : formatPortalTime(event.time);
}

function EventArticle({ event }: { readonly event: PortalEvent }) {
  return (
    <article className="rounded-3xl border border-border bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-curry-orange uppercase">
            {event.category ? categoryLabels[event.category] : "School event"}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-charcoal">
            {event.title}
          </h3>
        </div>
        <div className="rounded-2xl bg-soft-cream px-4 py-3 text-center">
          <p className="text-sm font-extrabold text-deep-orange">
            {formatPortalDate(event.date)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted-grey">
            {eventWindow(event)}
          </p>
        </div>
      </div>

      {event.summary ? (
        <p className="mt-4 leading-7 text-muted-grey">{event.summary}</p>
      ) : null}

      <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4 text-curry-orange" />
          <dt className="sr-only">Date</dt>
          <dd className="font-semibold text-charcoal">
            {formatPortalDate(event.date)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 aria-hidden="true" className="size-4 text-curry-orange" />
          <dt className="sr-only">Time</dt>
          <dd className="font-semibold text-charcoal">{eventWindow(event)}</dd>
        </div>
        {event.location ? (
          <div className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-4 text-curry-orange" />
            <dt className="sr-only">Location</dt>
            <dd className="font-semibold text-charcoal">{event.location}</dd>
          </div>
        ) : null}
        {event.contact ? (
          <div className="flex items-center gap-2">
            <Phone aria-hidden="true" className="size-4 text-curry-orange" />
            <dt className="sr-only">Contact</dt>
            <dd className="font-semibold text-charcoal">{event.contact}</dd>
          </div>
        ) : null}
      </dl>

      {event.details?.length ? (
        <ul className="mt-5 space-y-2">
          {event.details.map((detail) => (
            <li
              key={detail}
              className="flex gap-3 text-sm leading-6 text-muted-grey"
            >
              <span
                aria-hidden="true"
                className="mt-2 size-1.5 shrink-0 rounded-full bg-curry-orange"
              />
              {detail}
            </li>
          ))}
        </ul>
      ) : null}

      {event.programme?.length ? (
        <div className="mt-6 rounded-2xl border border-border bg-soft-white p-5">
          <p className="text-sm font-bold tracking-[0.12em] text-muted-grey uppercase">
            Programme
          </p>
          <ol className="mt-3 space-y-3">
            {event.programme.map((slot) => (
              <li key={`${slot.time}-${slot.item}`} className="flex gap-4">
                <span className="w-20 shrink-0 text-sm font-bold text-deep-orange tabular-nums">
                  {formatPortalTime(slot.time)}
                </span>
                <span className="text-sm leading-6 text-charcoal">
                  {slot.item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

/**
 * Events read as programme pages rather than a calendar table: one tab per kind
 * of event, each listing the full description, logistics and running order.
 */
export function EventsTabs({ events }: EventsTabsProps) {
  const categories = categoryOrder.filter((category) =>
    events.some((event) => event.category === category),
  );
  const tabs = [
    { id: "all", label: "All events" },
    ...categories.map((category) => ({
      id: category,
      label: categoryLabels[category],
    })),
  ];
  const [active, setActive] = useState<string>("all");
  const visible =
    active === "all"
      ? events
      : events.filter((event) => event.category === active);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Event categories"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-soft-white p-2"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`events-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`events-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                selected
                  ? "bg-curry-orange text-white"
                  : "text-charcoal hover:bg-white",
              )}
            >
              {tab.label}
              <span className="ml-2 text-xs font-semibold opacity-70">
                {tab.id === "all"
                  ? events.length
                  : events.filter((event) => event.category === tab.id).length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`events-panel-${active}`}
        aria-labelledby={`events-tab-${active}`}
        className="mt-6 space-y-6"
      >
        {visible.length ? (
          visible.map((event) => <EventArticle key={event.id} event={event} />)
        ) : (
          <p className="rounded-3xl border border-border bg-white p-8 text-sm text-muted-grey shadow-card">
            No events are listed in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
