import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { AnnouncementsView } from "@/components/portal/AnnouncementsView";
import { getPortalNotifications } from "@/lib/portal/data/documents";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Announcements",
};

type AnnouncementsPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function AnnouncementsPage({
  params,
}: AnnouncementsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const announcements = await getPortalNotifications();

  return (
    <>
      <DashboardHeader
        eyebrow="From the school"
        title="Announcements"
        description="School announcements and reminders for your account. Open one to read it in full — opening it marks it as read."
        badge="Live announcements"
      />

      <div className="mt-8">
        <AnnouncementsView announcements={announcements} />
      </div>
    </>
  );
}
