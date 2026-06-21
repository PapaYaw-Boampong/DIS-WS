import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { homeHeroSlides } from "@/data/home";

export function HomeHero() {
  const slide = homeHeroSlides[0];

  return (
    <section className="relative isolate overflow-hidden bg-curry-orange text-white">
      {slide.image ? (
        <ResponsiveImage
          image={slide.image}
          sizes="100vw"
          preload
          className="absolute inset-0 -z-20"
        />
      ) : null}
      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(17,24,39,0.9)_0%,rgba(17,24,39,0.76)_48%,rgba(17,24,39,0.34)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_28%,rgba(255,255,255,0.1),transparent_30%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 -bottom-48 -z-10 size-[520px] rounded-full border-[90px] border-white/5"
        aria-hidden="true"
      />
      <Container className="flex min-h-[560px] items-center py-20 sm:min-h-[600px] lg:min-h-[620px] lg:py-24">
        <div className="max-w-[1180px]">
          {slide.eyebrow ? (
            <p className="mb-5 text-sm font-extrabold tracking-[0.18em] text-soft-white uppercase">
              {slide.eyebrow}
            </p>
          ) : null}
          <h1 className="text-balance max-w-4xl text-5xl leading-[1.05] font-extrabold tracking-[-0.045em] sm:text-6xl lg:text-[4rem] lg:leading-[1.08]">
            {slide.title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-soft-white sm:text-[1.375rem]">
            {slide.description}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {/* <Button href={slide.primaryAction.href}>
              {slide.primaryAction.label}
            </Button> */}
            <Button href={slide.secondaryAction.href} variant="secondary">
              {slide.secondaryAction.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
