import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { historyMilestones } from "@/data/about";
import { routes } from "@/lib/routes";

export function HistoryPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Our History"
            title="A school story shaped by purpose"
            description="Our growth reflects a continuing commitment to strong learning, close family partnership and confident children."
          />
          <Button href={routes.history} variant="secondary">
            Explore Our History
          </Button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {historyMilestones.slice(0, 3).map((milestone, index) => (
            <article
              key={milestone.period}
              className="rounded-card border border-border bg-white p-7 shadow-card"
            >
              <span className="text-4xl font-extrabold text-curry-orange/35">
                0{index + 1}
              </span>
              <p className="mt-5 text-sm font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                {milestone.period}
              </p>
              <h3 className="mt-2 text-xl font-bold text-charcoal">
                {milestone.title}
              </h3>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
