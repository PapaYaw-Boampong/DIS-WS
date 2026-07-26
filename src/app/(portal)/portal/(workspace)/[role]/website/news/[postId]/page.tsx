import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { NewsForm } from "@/components/portal/cms/NewsForm";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { getCmsNewsPost } from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Edit Article" };

type EditNewsPageProps = {
  readonly params: Promise<{ role: string; postId: string }>;
};

export default async function EditWebsiteNewsPage({
  params,
}: EditNewsPageProps) {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const { postId } = await params;
  const post = await getCmsNewsPost(postId);

  if (!post) {
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
          title="Edit article"
          description="Update this notice. Published changes appear on the live website immediately."
          badge="Live content"
          action={
            post.status === "published" ? (
              <Link
                href={routes.newsArticle(post.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-curry-orange px-5 font-bold text-deep-orange transition-colors hover:bg-soft-cream"
              >
                <ExternalLink aria-hidden="true" className="size-4" />
                View live
              </Link>
            ) : undefined
          }
        />
      </div>

      <div className="mt-8 max-w-3xl">
        <DashboardCard title="Article details" description="">
          <NewsForm post={post} />
        </DashboardCard>
      </div>
    </>
  );
}
