import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { PhotoAlbumsManager } from "@/components/portal/cms/PhotoAlbumsManager";
import { listCmsPhotoAlbums } from "@/lib/portal/data/cms";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Photo Albums" };

type AlbumsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function WebsiteAlbumsPage({ params }: AlbumsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("website.manage"))) {
    notFound();
  }

  const albums = await listCmsPhotoAlbums();

  return (
    <>
      <DashboardHeader
        eyebrow="Public website"
        title="Photo albums"
        description="Share the Google Photos albums from school events. The website links to them, so the photographs stay in one place."
        badge="Website content"
      />

      <div className="mt-8 max-w-3xl">
        <DashboardCard
          title="Shared albums"
          description="Published albums appear on the Student Life page under Photos from our events."
        >
          <PhotoAlbumsManager albums={albums} />
        </DashboardCard>
      </div>
    </>
  );
}
