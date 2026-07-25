import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CalendarManager } from "@/components/portal/cms/CalendarManager";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listCmsCalendar } from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Website Calendar" };

export default async function WebsiteCalendarPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const terms = await listCmsCalendar();

  return (
    <>
      <Link
        href={portalRoutes.adminWebsite}
        className="inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Website content
      </Link>

      <div className="mt-4">
        <DashboardHeader
          eyebrow="Website content"
          title="School calendar"
          description="The academic term structure shown on the public calendar page."
          badge="Live content"
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <DashboardCard title="Academic terms" description="">
          <CalendarManager terms={terms} />
        </DashboardCard>
      </div>
    </>
  );
}
