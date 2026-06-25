import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
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
  return (
    <>
      <DashboardHeader
        eyebrow="Family calendar"
        title="Events"
        description="Review parent-facing school events in a dedicated tab instead of a dashboard side card."
        badge="Mock calendar"
      />

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
