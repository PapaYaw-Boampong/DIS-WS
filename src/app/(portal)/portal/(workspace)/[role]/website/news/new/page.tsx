import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NewsForm } from "@/components/portal/cms/NewsForm";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "New Article" };

export default async function NewWebsiteNewsPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  return (
    <>
      <Link
        href={portalRoutes.adminWebsiteNews}
        className="inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        News & updates
      </Link>

      <div className="mt-4">
        <DashboardHeader
          eyebrow="Website content"
          title="New article"
          description="Write a notice for the public News page. Save as a draft, or publish it live."
          badge="Live content"
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <DashboardCard title="Article details" description="">
          <NewsForm />
        </DashboardCard>
      </div>
    </>
  );
}
