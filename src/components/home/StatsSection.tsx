import { Container } from "@/components/ui/Container";
import { homeStats } from "@/data/home";

export function StatsSection() {
  return (
    <section
      className="relative z-10 -mt-14 sm:-mt-16"
      aria-label="School statistics"
    >
      <Container>
        <dl className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-10">
          {homeStats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-h-28 flex-col justify-center rounded-[1.375rem] bg-white px-5 py-5 shadow-card-strong sm:min-h-32 sm:px-6"
            >
              <dd className="text-3xl font-extrabold tracking-tight text-curry-orange sm:text-[2.375rem]">
                {stat.value}
              </dd>
              <dt className="mt-1 text-sm leading-5 font-semibold text-charcoal sm:text-base">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
