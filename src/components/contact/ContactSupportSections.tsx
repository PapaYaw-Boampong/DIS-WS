import Link from "next/link";

import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { routes } from "@/lib/routes";

export function ContactSupportSections() {
  return (
    <>
      <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-card border border-border bg-white p-7 shadow-card sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
              <ContentIcon name="clipboard-check" className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-charcoal">
              Admissions contact
            </h2>
            <p className="mt-4 leading-7 text-muted-grey">
              Families interested in joining Divine can review admissions steps,
              requirements and the enquiry form.
            </p>
            <Link
              href={routes.admissions}
              className="mt-6 inline-flex text-sm font-bold text-curry-orange hover:text-deep-orange"
            >
              Visit Admissions
            </Link>
          </article>
          <article className="rounded-card border border-border bg-white p-7 shadow-card sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
              <ContentIcon name="lock-keyhole" className="size-6" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-charcoal">
              Portal support
            </h2>
            <p className="mt-4 leading-7 text-muted-grey">
              Portal access is coming soon. Use the portal landing page to
              understand future access pathways and support expectations.
            </p>
            <Link
              href={routes.portal}
              className="mt-6 inline-flex text-sm font-bold text-curry-orange hover:text-deep-orange"
            >
              View Portals
            </Link>
          </article>
        </Container>
      </section>
      <CTASection
        title="Plan your visit"
        description="Use the location page for map access and visit notes, or begin an admissions enquiry if you are ready to learn more."
        primaryLabel="Find the School"
        primaryHref={routes.location}
        secondaryLabel="Apply Now"
        secondaryHref={routes.admissions}
      />
    </>
  );
}
