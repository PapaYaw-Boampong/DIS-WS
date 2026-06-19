import { ArrowRight, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { admissionsFees } from "@/data/admissions";
import { routes } from "@/lib/routes";

export function FeesPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-charcoal px-6 py-10 text-white shadow-card sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
          <div
            className="absolute -right-20 -bottom-28 size-72 rounded-full border-[52px] border-white/5"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-curry-orange">
              <ReceiptText aria-hidden="true" className="size-7" />
            </div>
            <p className="mt-6 text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
              {admissionsFees.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {admissionsFees.title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-soft-white">
              {admissionsFees.description}
            </p>
          </div>
          <div className="relative mt-8 shrink-0 lg:mt-0">
            <Button href={routes.contact} variant="secondary" size="lg">
              Request Current Fee Schedule
              <ArrowRight aria-hidden="true" className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
