import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { studentLifeHero } from "@/data/studentLife";

export function StudentLifeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-curry-orange py-24 text-white sm:py-32 lg:py-44">
      <ResponsiveImage
        image={studentLifeHero.image}
        sizes="100vw"
        preload
        className="absolute inset-0 -z-20"
      />
      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(17,24,39,0.88)_0%,rgba(17,24,39,0.7)_52%,rgba(17,24,39,0.3)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-28 -bottom-40 -z-10 size-[440px] rounded-full border-[76px] border-white/5"
        aria-hidden="true"
      />
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-balance text-5xl font-extrabold tracking-[-0.04em] uppercase sm:text-6xl lg:text-7xl">
            {studentLifeHero.title}
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-soft-white sm:text-xl">
            {studentLifeHero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={studentLifeHero.primaryAction.href} size="lg">
              {studentLifeHero.primaryAction.label}
            </Button>
            <Button
              href={studentLifeHero.secondaryAction.href}
              variant="secondary"
              size="lg"
            >
              {studentLifeHero.secondaryAction.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
