import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Wallet,
} from "lucide-react";

import { formatPortalDate } from "@/lib/portal/format";
import type { CalendarEntry, CalendarEntryType } from "@/lib/portal/data/calendar";
import { cn } from "@/lib/utils";

type PortalCalendarProps = {
  readonly role: string;
  readonly month: string; // YYYY-MM
  readonly today: string; // YYYY-MM-DD
  readonly entries: readonly CalendarEntry[];
};

const typeStyles: Record<
  CalendarEntryType,
  { label: string; dot: string; chip: string; icon: typeof CalendarDays }
> = {
  timetable: {
    label: "Lesson",
    dot: "bg-sky-500",
    chip: "border-sky-200 bg-sky-50",
    icon: Clock,
  },
  assignment: {
    label: "Assignment",
    dot: "bg-curry-orange",
    chip: "border-curry-orange/30 bg-soft-cream",
    icon: BookOpen,
  },
  event: {
    label: "School event",
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50",
    icon: CalendarDays,
  },
  fee: {
    label: "Fees due",
    dot: "bg-red-500",
    chip: "border-red-200 bg-red-50",
    icon: Wallet,
  },
  report_card: {
    label: "Report card",
    dot: "bg-violet-500",
    chip: "border-violet-200 bg-violet-50",
    icon: GraduationCap,
  },
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function shiftMonth(month: string, delta: number): string {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (index ?? 1) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [year, index] = month.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, (index ?? 1) - 1, 1)).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
}

// The grid always starts on a Monday and runs whole weeks, so every month has
// the same shape and the weekday columns line up.
function monthGrid(month: string): string[] {
  const [year, index] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year ?? 1970, (index ?? 1) - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - offset);

  const cells: string[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    cells.push(day.toISOString().slice(0, 10));
  }
  return cells;
}

/**
 * A month grid plus an agenda of what is coming up.
 *
 * Rendered on the server with no client state: the month is a URL parameter, so
 * a particular month can be linked, bookmarked and opened by a parent from a
 * message without the page having to hydrate first.
 */
export function PortalCalendar({
  role,
  month,
  today,
  entries,
}: PortalCalendarProps) {
  const byDate = new Map<string, CalendarEntry[]>();
  for (const entry of entries) {
    byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), entry]);
  }

  const cells = monthGrid(month);
  const upcoming = entries
    .filter((entry) => entry.date >= today)
    .slice(0, 12);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-[-0.02em] text-charcoal">
          {monthLabel(month)}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/portal/${role}/calendar?month=${shiftMonth(month, -1)}`}
            aria-label="Previous month"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-charcoal transition-colors hover:bg-soft-white"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={`/portal/${role}/calendar`}
            className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
          >
            Today
          </Link>
          <Link
            href={`/portal/${role}/calendar?month=${shiftMonth(month, 1)}`}
            aria-label="Next month"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-charcoal transition-colors hover:bg-soft-white"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label) => (
              <p
                key={label}
                className="pb-1 text-center text-xs font-bold tracking-[0.1em] text-muted-grey uppercase"
              >
                {label}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((date) => {
              const dayEntries = byDate.get(date) ?? [];
              const inMonth = date.startsWith(month);
              const isToday = date === today;

              return (
                <div
                  key={date}
                  className={cn(
                    "min-h-24 rounded-2xl border p-2",
                    inMonth
                      ? "border-border bg-white"
                      : "border-transparent bg-soft-white/60",
                    isToday && "border-curry-orange ring-2 ring-curry-orange/20",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      inMonth ? "text-charcoal" : "text-muted-grey/60",
                      isToday && "text-deep-orange",
                    )}
                  >
                    {Number(date.slice(8, 10))}
                  </p>

                  <ul className="mt-1 space-y-1">
                    {dayEntries.slice(0, 3).map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center gap-1.5 truncate text-[0.7rem] leading-4 text-charcoal"
                        title={`${entry.title} — ${entry.detail}`}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            typeStyles[entry.type].dot,
                          )}
                        />
                        <span className="truncate">
                          {entry.startTime ? `${entry.startTime} ` : ""}
                          {entry.title}
                        </span>
                      </li>
                    ))}
                    {dayEntries.length > 3 ? (
                      <li className="text-[0.7rem] font-bold text-muted-grey">
                        +{dayEntries.length - 3} more
                      </li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {(Object.keys(typeStyles) as CalendarEntryType[]).map((type) => (
          <span
            key={type}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-grey"
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full", typeStyles[type].dot)}
            />
            {typeStyles[type].label}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-extrabold tracking-[-0.02em] text-charcoal">
          Coming up
        </h3>

        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-grey">
            Nothing scheduled in this period.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((entry) => {
              const style = typeStyles[entry.type];
              const Icon = style.icon;

              return (
                <li
                  key={entry.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4",
                    style.chip,
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-charcoal"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-charcoal">{entry.title}</p>
                      <p className="mt-0.5 text-sm text-muted-grey">
                        {entry.detail}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">
                    {formatPortalDate(entry.date)}
                    {entry.startTime ? ` · ${entry.startTime}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
