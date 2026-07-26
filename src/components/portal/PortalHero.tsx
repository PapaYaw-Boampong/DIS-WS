import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { portalHero } from "@/data/portals";
import { routes } from "@/lib/routes";

export function PortalHero() {
  return (
    <section className="relative isolate overflow-hidden bg-curry-orange pt-[calc(var(--header-h)+4rem)] pb-24 text-white sm:pt-[calc(var(--header-h)+5rem)] sm:pb-32 lg:pt-[calc(var(--header-h)+7rem)] lg:pb-44">
      <div
        className="absolute -right-28 -bottom-40 -z-10 size-[440px] rounded-full border-[76px] border-white/5"
        aria-hidden="true"
      />
      <Container>
        <div className="max-w-4xl">
          <h1 className="font-display text-balance text-4xl font-semibold tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            {portalHero.title}
          </h1>
          <p className="mt-10 max-w-2xl text-lg leading-8 text-soft-white sm:text-xl">
            {portalHero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={routes.admissions} size="lg">
              Apply Now
            </Button>
            <Button href="#portal-pathways" variant="secondary" size="lg">
              Explore Portals
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
