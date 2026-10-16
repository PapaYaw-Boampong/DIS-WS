import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { EventsTabs } from "@/components/portal/EventsTabs";
import { listEvents } from "@/lib/portal/data/communication";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const events = (await listEvents())
    .filter((event) => event.audience === "all" || event.audience === "parent")
    .toSorted((first, second) => first.date.localeCompare(second.date));

  return (
    <>
      <DashboardHeader
        eyebrow="Family calendar"
        title="Events"
        description="What is coming up at school, what happens on the day, and what your family needs to bring or know."
        badge="School calendar"
      />

      <div className="mt-8">
        <EventsTabs events={events} />
      </div>
    </>
  );
}
