import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listCmsNews } from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Website News" };

export default async function WebsiteNewsPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const news = await listCmsNews();

  const rows: readonly DataTableRow[] = news.map((post) => ({
    id: post.id,
    cells: [
      <Link
        key={post.id}
        href={portalRoutes.adminWebsiteNewsEdit(post.id)}
        className="font-bold text-charcoal hover:text-deep-orange"
      >
        {post.title}
      </Link>,
      post.category,
      <StatusBadge
        key={`${post.id}-status`}
        variant={post.status === "published" ? "success" : "neutral"}
      >
        {post.status === "published" ? "Live" : "Draft"}
      </StatusBadge>,
      <Link
        key={`${post.id}-edit`}
        href={portalRoutes.adminWebsiteNewsEdit(post.id)}
        className="text-sm font-bold text-deep-orange hover:underline"
      >
        Edit
      </Link>,
    ],
  }));

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
          title="News & updates"
          description="Create and edit the notices shown on the public News page."
          badge="Live content"
          action={
            <Link
              href={portalRoutes.adminWebsiteNewsNew}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-5 font-bold text-white transition-colors hover:bg-deep-orange"
            >
              <Plus aria-hidden="true" className="size-5" />
              New article
            </Link>
          }
        />
      </div>

      <div className="mt-8">
        <DashboardCard
          title="Articles"
          description="Drafts are hidden from the public site until published."
        >
          {news.length === 0 ? (
            <p className="py-4 text-sm text-muted-grey">
              No articles yet. Create your first one with “New article”.
            </p>
          ) : (
            <DataTable
              caption="Website news articles"
              columns={["Title", "Category", "Status", ""]}
              rows={rows}
            />
          )}
        </DashboardCard>
      </div>
    </>
  );
}
