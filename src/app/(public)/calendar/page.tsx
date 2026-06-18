import type { Metadata } from "next";

import { CalendarSchedule } from "@/components/academics/CalendarSchedule";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { academicMetadata } from "@/data/academics";
import { routes } from "@/lib/routes";

export const metadata: Metadata = academicMetadata.calendar;

export default function CalendarPage() {
  return (
    <>
      <PageHero
        eyebrow="2026 Academic Year"
        title="School Calendar"
        description="Plan for the academic year with an overview of terms, progress points and school community events."
        variant="orange"
      />
      <CalendarSchedule />
      <CTASection
        title="Need help planning for the school year?"
        description="Contact the school for the latest approved term dates, event details and family information."
        primaryLabel="Contact Us"
        primaryHref={routes.contact}
        secondaryLabel="Explore Academics"
        secondaryHref={routes.academics}
      />
    </>
  );
}
