import type { Metadata } from "next";

import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { documentsHero, documentsMetadata } from "@/data/documents";
import { routes } from "@/lib/routes";

export const metadata: Metadata = documentsMetadata;

export default function DocumentsPage() {
  return (
    <>
      <PageHero
        eyebrow={documentsHero.eyebrow}
        title={documentsHero.title}
        description={documentsHero.description}
        variant="orange"
      />
      <DocumentLibrary />
      <CTASection
        title="Need a specific document?"
        description="If a document you need is not yet published here, contact the school office and we will be glad to help."
        primaryLabel="Contact Us"
        primaryHref={routes.contact}
        secondaryLabel="View Calendar"
        secondaryHref={routes.calendar}
      />
    </>
  );
}
