import { Container } from "@/components/ui/Container";
import { historyLegacy } from "@/data/about";

export function HistoryLegacy() {
  return (
    <section className="bg-charcoal py-20 text-white sm:py-24">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
            {historyLegacy.eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
            {historyLegacy.title}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-soft-white/80 sm:text-xl">
            {historyLegacy.description}
          </p>
        </div>
      </Container>
    </section>
  );
}
