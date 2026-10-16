import "server-only";

import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";

export type CalendarEntryType =
  | "timetable"
  | "assignment"
  | "event"
  | "fee"
  | "report_card";

export type CalendarEntry = {
  readonly id: string;
  readonly type: CalendarEntryType;
  readonly title: string;
  readonly detail: string;
  readonly date: string;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
};

export type CalendarWindow = {
  readonly from: string;
  readonly to: string;
  readonly entries: readonly CalendarEntry[];
  readonly isLive: boolean;
};

/**
 * Everything the signed-in user has a date for, in one window. What is included
 * is decided server-side by role — the portal asks for a date range, not for a
 * set of sources it could get wrong.
 */
export async function getMyCalendar(
  from: string,
  to: string,
): Promise<CalendarWindow> {
  if (!useRealPortalAuth) {
    return { from, to, entries: [], isLive: false };
  }

  const data = await portalApiGet<{
    from?: string;
    to?: string;
    entries?: CalendarEntry[];
  }>(`/me/calendar?from=${from}&to=${to}`, {});

  return {
    from: data.from ?? from,
    to: data.to ?? to,
    entries: data.entries ?? [],
    isLive: Array.isArray(data.entries),
  };
}
