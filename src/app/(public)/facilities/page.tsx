import type { Metadata } from "next";

import { FacilitiesGrid } from "@/components/facilities/FacilitiesGrid";
import { FacilitiesOverview } from "@/components/facilities/FacilitiesOverview";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import {
  facilities,
  facilitiesHero,
  facilitiesMetadata,
} from "@/data/facilities";
import { routes } from "@/lib/routes";

export const metadata: Metadata = facilitiesMetadata;

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        eyebrow={facilitiesHero.eyebrow}
        title={facilitiesHero.title}
        description={facilitiesHero.description}
        variant="orange"
      />
      <FacilitiesOverview />
      <FacilitiesGrid
        eyebrow="On Campus"
        title="Facilities that support everyday learning"
        items={facilities}
        background="soft-white"
      />
      {/* Planned / "In the pipeline" facilities are hidden for now.
          Restore this block (and the `plannedFacilities` import) to show
          the football pitch, playground and basketball court.
      <FacilitiesGrid
        eyebrow="Coming Soon"
        title="In the pipeline"
        description="We are expanding our campus with new spaces for sport and play."
        items={plannedFacilities}
        background="soft-white"
      />
      */}
      <CTASection
        title="Come and see Divine for yourself"
        description="Arrange a visit or speak with our team to learn more about our campus, facilities and daily school life."
        primaryLabel="Apply to Divine"
        primaryHref={routes.admissions}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
