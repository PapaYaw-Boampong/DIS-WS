import type { Metadata } from "next";

import { CommunityConnect } from "@/components/community/CommunityConnect";
import { ContactDetailsSection } from "@/components/contact/ContactDetailsSection";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactSupportSections } from "@/components/contact/ContactSupportSections";
import { PageHero } from "@/components/ui/PageHero";
import { contactHero, contactMetadata } from "@/data/contact";

export const metadata: Metadata = contactMetadata;

export default function ContactPage() {
  return (
    <>
      <PageHero
        title={contactHero.title}
        description={contactHero.description}
        variant="orange"
        align="center"
      />
      <ContactDetailsSection />
      <CommunityConnect />
      <ContactForm />
      <ContactSupportSections />
    </>
  );
}
