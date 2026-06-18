import { ChevronDown } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { admissionFAQs } from "@/data/admissions";

export function AdmissionsFAQ() {
  return (
    <section className="pattern-checker py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Common Questions"
          title="Admissions FAQ"
          description="These answers provide general guidance. Admissions will confirm the details that apply to your family."
          align="center"
        />
        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {admissionFAQs.map((item) => (
            <details
              key={item.question}
              className="group rounded-card border border-border bg-white shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-6 text-lg font-bold text-charcoal sm:px-7">
                {item.question}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-curry-orange transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="border-t border-border px-5 py-6 leading-7 text-muted-grey sm:px-7">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
