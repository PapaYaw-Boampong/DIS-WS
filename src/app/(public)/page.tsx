import type { Metadata } from "next";

import { AcademicPreview } from "@/components/home/AcademicPreview";
import { EventsPreview } from "@/components/home/EventsPreview";
import { HomeHero } from "@/components/home/HomeHero";
import { JoinPathways } from "@/components/home/JoinPathways";
import { NewsPreview } from "@/components/home/NewsPreview";
import { SchoolMessage } from "@/components/home/SchoolMessage";
import { StatsSection } from "@/components/home/StatsSection";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const metadata: Metadata = createPageMetadata({
  title: "Home",
  description:
    "Discover Divine International School, a caring learning community focused on excellence, discipline and character.",
  path: routes.home,
});

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <StatsSection />
      <WelcomeSection />
      <SchoolMessage />
      <JoinPathways />
      <AcademicPreview />
      <EventsPreview />
      <NewsPreview />
    </>
  );
}
