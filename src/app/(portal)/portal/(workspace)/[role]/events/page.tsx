import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { mockPortalEvents } from "@/data/portal/announcements";
import {
  formatPortalDate,
  formatPortalTime,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const events = mockPortalEvents
    .filter((event) => event.audience === "all" || event.audience === "parent")
    .toSorted((a, b) => a.date.localeCompare(b.date));
  const upcomingRows: readonly DataTableRow[] = events.map((event) => ({
    id: event.id,
    cells: [
      event.title,
      formatPortalDate(event.date),
      event.time ? formatPortalTime(event.time) : "Time to be confirmed",
      event.audience === "parent" ? "Parents" : "All families",
    ],
  }));
  const nextEvent = events[0];

  return (
    <>
      <DashboardHeader
        eyebrow="Family calendar"
        title="Events"
        description="Review parent-facing school events in a dedicated tab instead of a dashboard side card."
        badge="Mock calendar"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Upcoming events"
          value={String(events.length)}
          detail="Parent-visible items"
          icon={<CalendarDays aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Next event"
          value={nextEvent ? formatPortalDate(nextEvent.date) : "None"}
          detail={nextEvent?.title ?? "No event scheduled"}
          icon={<Clock3 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Linked wards"
          value={String(context.students.length)}
          detail="Family calendar context"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Upcoming school events"
        description="Events remain mock data until the future backend calendar is connected."
        className="mt-8"
      >
        <DataTable
          caption="Parent event list"
          columns={["Event", "Date", "Time", "Audience"]}
          rows={upcomingRows}
        />
      </DashboardCard>
    </>
  );
}
