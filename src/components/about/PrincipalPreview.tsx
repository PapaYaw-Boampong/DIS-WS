import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { principalProfile } from "@/data/about";

export function PrincipalPreview() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <AboutImagePlaceholder
          label={principalProfile.role}
          description={principalProfile.imageDescription}
          icon={principalProfile.icon}
          image={principalProfile.image}
          aspect="portrait"
          className="mx-auto w-full max-w-md"
        />
        <div>
          <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
            A Welcome from Leadership
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-[-0.03em] text-charcoal sm:text-4xl lg:text-[2.625rem]">
            {principalProfile.title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-grey">
            {principalProfile.description}
          </p>
          <blockquote className="mt-7 border-l-4 border-curry-orange pl-6 text-xl leading-8 font-semibold text-charcoal">
            “{principalProfile.quote}”
          </blockquote>
          <Button href={principalProfile.action.href} className="mt-8">
            {principalProfile.action.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
