import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inbox, MailQuestion, CircleCheckBig } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { InquiriesManager } from "@/components/portal/InquiriesManager";
import { MetricCard } from "@/components/portal/MetricCard";
import { listInquiries } from "@/lib/portal/data/forms";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }
  const inquiries = await listInquiries();
  const open = inquiries.filter((i) => i.status !== "resolved").length;
  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <>
      <DashboardHeader
        eyebrow="Community"
        title="Inquiries"
        description="Contact and admissions enquiries submitted from the website. Update the status and keep internal notes."
        badge="Inbox"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetricCard
          label="Total"
          value={String(inquiries.length)}
          detail="All enquiries"
          icon={<Inbox aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="New"
          value={String(newCount)}
          detail="Awaiting first review"
          icon={<MailQuestion aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Open"
          value={String(open)}
          detail="Not yet resolved"
          icon={<CircleCheckBig aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8">
        <DashboardCard
          title="Enquiries"
          description="Reply by email, move each through New → In progress → Resolved."
        >
          <InquiriesManager inquiries={inquiries} />
        </DashboardCard>
      </div>
    </>
  );
}
