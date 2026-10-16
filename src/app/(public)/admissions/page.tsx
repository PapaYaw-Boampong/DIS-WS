import type { Metadata } from "next";

import { AdmissionsEnquiryForm } from "@/components/admissions/AdmissionsEnquiryForm";
import { AdmissionsFAQ } from "@/components/admissions/AdmissionsFAQ";
import { AdmissionsIntroduction } from "@/components/admissions/AdmissionsIntroduction";
import { AdmissionsSteps } from "@/components/admissions/AdmissionsSteps";
import { RequirementsSection } from "@/components/admissions/RequirementsSection";
import { WhyChooseDivine } from "@/components/admissions/WhyChooseDivine";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { admissionsHero, admissionsMetadata } from "@/data/admissions";
import { school } from "@/data/school";
import { siteImages } from "@/lib/images";

export const metadata: Metadata = admissionsMetadata;

export default function AdmissionsPage() {
  return (
    <>
      <PageHero
        title={admissionsHero.title}
        description={admissionsHero.description}
        images={admissionsHero.images}
        preloadImage
        variant="orange"
        align="center"
        size="spacious"
      />
      <AdmissionsSteps />
      <AdmissionsIntroduction />
      <RequirementsSection />
      <AdmissionsEnquiryForm />
      <WhyChooseDivine />
      
      <AdmissionsFAQ />
      <CTASection
        backgroundImage={siteImages.ctaEntrance}
        title="Take the next step with Divine"
        description="Prepare your enquiry or contact Admissions for current application, document and fee information."
        primaryLabel="Apply Now"
        primaryHref="#application-enquiry"
        secondaryLabel="Contact Admissions"
        secondaryHref={`mailto:${school.admissionsEmail}`}
      />
    </>
  );
}
