import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { PortalCalendar } from "@/components/portal/PortalCalendar";
import { getMyCalendar } from "@/lib/portal/data/calendar";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Calendar" };

type CalendarPageProps = {
  readonly params: Promise<{ role: string }>;
  readonly searchParams?: Promise<{ month?: string }>;
};

// Descriptions differ by role because the calendars genuinely differ — saying
// "your lessons" to a parent who has none would be wrong.
const descriptions: Record<string, string> = {
  student:
    "Your lessons, assignment due dates and school events in one place.",
  staff:
    "Your teaching schedule, when work is due in from your classes, and school events.",
  parent:
    "School events, fee due dates and report card releases for your family.",
};

function monthOf(date: string): string {
  return date.slice(0, 7);
}

function monthBounds(month: string): { from: string; to: string } {
  const [year, index] = month.split("-").map(Number);
  // The grid shows leading and trailing days from the neighbouring months, so
  // the window is padded a week either side rather than clipped to the 1st.
  const start = new Date(Date.UTC(year ?? 1970, (index ?? 1) - 1, 1));
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(Date.UTC(year ?? 1970, index ?? 1, 0));
  end.setUTCDate(end.getUTCDate() + 7);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default async function CalendarPage({
  params,
  searchParams,
}: CalendarPageProps) {
  const { role } = await params;
  const session = await getMockPortalSession();

  if (!isPortalRole(role) || !session || session.user.role !== role) {
    notFound();
  }

  const today = new Date().toISOString().slice(0, 10);
  const requested = (await searchParams)?.month;
  const month = /^\d{4}-\d{2}$/.test(requested ?? "")
    ? (requested as string)
    : monthOf(today);

  const { from, to } = monthBounds(month);
  const { entries, isLive } = await getMyCalendar(from, to);

  return (
    <>
      <DashboardHeader
        eyebrow="Your schedule"
        title="Calendar"
        description={
          descriptions[role] ??
          "School events and the dates that matter for your role."
        }
        badge="Calendar"
      />

      <div className="mt-8">
        <DashboardCard
          title="Month"
          description={
            isLive
              ? "Everything dated for you, drawn from the school's records."
              : "The calendar reads from the school database, which is not connected yet."
          }
        >
          <PortalCalendar
            role={role}
            month={month}
            today={today}
            entries={entries}
          />
        </DashboardCard>
      </div>
    </>
  );
}
