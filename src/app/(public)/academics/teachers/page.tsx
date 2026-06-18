import type { Metadata } from "next";

import { TeacherGrid } from "@/components/academics/TeacherGrid";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import { academicMetadata } from "@/data/academics";
import { routes } from "@/lib/routes";

export const metadata: Metadata = academicMetadata.teachers;

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Teaching Community"
        title="Meet Our Teachers"
        description="Dedicated teaching teams create clear, caring and purposeful learning experiences across every stage."
        variant="orange"
      />
      <TeacherGrid />
      <CTASection
        title="Learn more about academics at Divine"
        description="Explore our academic levels or speak with the school about the learning pathway that fits your child."
        primaryLabel="Explore Academics"
        primaryHref={routes.academics}
        secondaryLabel="Contact Us"
        secondaryHref={routes.contact}
      />
    </>
  );
}
