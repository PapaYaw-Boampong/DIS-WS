import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/lib/routes";

export function TeachersPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <ImagePlaceholder
          label="Divine teaching community"
          description="Placeholder for an approved photograph showing teachers at Divine International School."
          icon="users"
        />
        <div>
          <SectionHeader
            eyebrow="Meet Our Teachers"
            title="Teachers who guide, challenge and encourage"
            description="Our teaching teams work across each stage to establish clear expectations, understand learner progress and create a supportive classroom culture."
          />
          <Link
            href={routes.teachers}
            className="mt-7 inline-flex items-center gap-2 font-semibold text-curry-orange transition-colors hover:text-deep-orange"
          >
            Meet Our Teaching Teams
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
