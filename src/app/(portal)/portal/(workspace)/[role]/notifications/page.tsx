import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { NotificationsView } from "@/components/portal/NotificationsView";
import { getPortalNotifications } from "@/lib/portal/data/documents";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Notifications",
};

type NotificationsPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function NotificationsPage({
  params,
}: NotificationsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const notifications = await getPortalNotifications();

  return (
    <>
      <DashboardHeader
        eyebrow="Alerts"
        title="Notifications"
        description="School alerts and reminders for your account. Read state is kept in your browser in this phase."
        badge="Live notifications"
      />

      <div className="mt-8">
        <NotificationsView notifications={notifications} />
      </div>
    </>
  );
}
