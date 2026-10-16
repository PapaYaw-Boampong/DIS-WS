import type { Metadata } from "next";

import { ActivitiesSection } from "@/components/student-life/ActivitiesSection";
import { CampusLifeSection } from "@/components/student-life/CampusLifeSection";
import { ExperienceOverview } from "@/components/student-life/ExperienceOverview";
import { GalleryPreview } from "@/components/student-life/GalleryPreview";
import { PhotoAlbumsSection } from "@/components/student-life/PhotoAlbumsSection";
import { SocialFollowSection } from "@/components/student-life/SocialFollowSection";
import { StudentLifeHero } from "@/components/student-life/StudentLifeHero";
import { VoicesSection } from "@/components/student-life/VoicesSection";
import { CTASection } from "@/components/ui/CTASection";
import { studentLifeMetadata } from "@/data/studentLife";
import { getPublishedPhotoAlbums } from "@/lib/public-content";
import { routes } from "@/lib/routes";
import { siteImages } from "@/lib/images";

export const metadata: Metadata = studentLifeMetadata;

export default async function StudentLifePage() {
  const albums = await getPublishedPhotoAlbums();

  return (
    <>
      <StudentLifeHero />
      <ExperienceOverview />
      <CampusLifeSection />
      <ActivitiesSection />
      <VoicesSection />
      <SocialFollowSection />
      <GalleryPreview />
      <PhotoAlbumsSection albums={albums} />
      <CTASection
        backgroundImage={siteImages.ctaDining}
        title="Experience the Divine school community"
        description="Explore the school calendar or begin an admissions enquiry to learn how your family can join Divine International School."
        primaryLabel="Apply Now"
        primaryHref={routes.admissions}
        secondaryLabel="View Calendar"
        secondaryHref={routes.calendar}
      />
    </>
  );
}
