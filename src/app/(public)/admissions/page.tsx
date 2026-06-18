import type { Metadata } from "next";

import { AdmissionsEnquiryForm } from "@/components/admissions/AdmissionsEnquiryForm";
import { AdmissionsFAQ } from "@/components/admissions/AdmissionsFAQ";
import { AdmissionsIntroduction } from "@/components/admissions/AdmissionsIntroduction";
import { AdmissionsSteps } from "@/components/admissions/AdmissionsSteps";
import { FeesPreview } from "@/components/admissions/FeesPreview";
import { RequirementsSection } from "@/components/admissions/RequirementsSection";
import { WhyChooseDivine } from "@/components/admissions/WhyChooseDivine";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { admissionsHero, admissionsMetadata } from "@/data/admissions";
import { routes } from "@/lib/routes";

export const metadata: Metadata = admissionsMetadata;

export default function AdmissionsPage() {
  return (
    <>
      <PageHero
        title={admissionsHero.title}
        description={admissionsHero.description}
        image={admissionsHero.image}
        preloadImage
        variant="orange"
        align="center"
        size="spacious"
      />
      <AdmissionsIntroduction />
      <RequirementsSection />
      <AdmissionsSteps />
      <FeesPreview />
      <AdmissionsEnquiryForm />
      <WhyChooseDivine />
      
      <AdmissionsFAQ />
      <CTASection
        title="Take the next step with Divine"
        description="Prepare your enquiry or contact Admissions for current application, document and fee information."
        primaryLabel="Apply Now"
        primaryHref="#application-enquiry"
        secondaryLabel="Contact Admissions"
        secondaryHref={routes.contact}
      />
    </>
  );
}
