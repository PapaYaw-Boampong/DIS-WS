import type { Metadata } from "next";

import { LocationMapSection } from "@/components/location/LocationMapSection";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import {
  locationActions,
  locationHero,
  locationMetadata,
} from "@/data/location";

export const metadata: Metadata = locationMetadata;

export default function LocationPage() {
  return (
    <>
      <PageHero
        title={locationHero.title}
        description={locationHero.description}
        variant="orange"
        align="center"
      />
      <LocationMapSection />
      <CTASection
        title="Need help planning a visit?"
        description="Contact the school for current directions, office availability and admissions visit guidance."
        primaryLabel="Contact Us"
        primaryHref={locationActions.contact}
        secondaryLabel="Apply Now"
        secondaryHref={locationActions.admissions}
      />
    </>
  );
}
