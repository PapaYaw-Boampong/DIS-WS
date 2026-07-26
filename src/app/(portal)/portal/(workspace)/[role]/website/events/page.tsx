import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EventsManager } from "@/components/portal/cms/EventsManager";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listCmsEvents } from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Website Events" };

export default async function WebsiteEventsPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const events = await listCmsEvents();

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
          title="Events"
          description="Event cards shown on the public calendar page, and optionally featured on the homepage."
          badge="Live content"
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <DashboardCard title="Events" description="">
          <EventsManager events={events} />
        </DashboardCard>
      </div>
    </>
  );
}
