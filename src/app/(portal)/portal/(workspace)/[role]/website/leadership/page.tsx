import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LeadershipManager } from "@/components/portal/cms/LeadershipManager";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listCmsLeadership } from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Website Leadership" };

export default async function WebsiteLeadershipPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const staff = await listCmsLeadership();

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
          title="Leadership"
          description="Choose which staff appear on the public Leadership & Management page, and how. Names come from the registry, so a correction there updates the site too."
          badge="Live content"
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <DashboardCard title="Leadership profiles" description="">
          <LeadershipManager staff={staff} />
        </DashboardCard>
      </div>
    </>
  );
}
