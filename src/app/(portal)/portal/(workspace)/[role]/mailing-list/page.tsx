import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MailingListManager } from "@/components/portal/MailingListManager";
import { listMailingSignups } from "@/lib/portal/data/forms";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Mailing List" };

export default async function MailingListPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }
  const signups = await listMailingSignups();

  return (
    <>
      <DashboardHeader
        eyebrow="Community"
        title="Mailing list"
        description="Review the people who joined from the website and send them school updates."
        badge="Subscribers"
      />
      <div className="mt-8 max-w-3xl">
        <DashboardCard
          title="Updates & subscribers"
          description="Compose an update to send to active subscribers, or export the list."
        >
          <MailingListManager signups={signups} />
        </DashboardCard>
      </div>
    </>
  );
}
