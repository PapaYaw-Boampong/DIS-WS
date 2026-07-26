import type { Metadata } from "next";

import {
  CalendarEventsSection,
  CalendarTermsSection,
} from "@/components/academics/CalendarSchedule";
import { CalendarPdfViewer } from "@/components/academics/CalendarPdfViewer";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { academicMetadata } from "@/data/academics";
import { getCalendarPdf } from "@/lib/public-content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = academicMetadata.calendar;

export default async function CalendarPage() {
  const { hasPdf, url } = await getCalendarPdf();

  return (
    <>
      <PageHero
        eyebrow="2026 Academic Year"
        title="School Calendar"
        description="Plan for the academic year with an overview of terms, progress points and school community events."
        variant="orange"
      />
      {hasPdf ? (
        <section className="bg-white py-20 sm:py-24 lg:py-28">
          <Container>
            <SectionHeader
              eyebrow="2026 Academic Year"
              title="The official school calendar"
              description="Turn the pages to explore the full academic calendar."
              align="center"
            />
            <div className="mt-12">
              <CalendarPdfViewer src={url} />
            </div>
          </Container>
        </section>
      ) : (
        <CalendarTermsSection />
      )}
      <CalendarEventsSection />
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
