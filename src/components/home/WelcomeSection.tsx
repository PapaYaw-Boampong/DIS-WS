import { Button } from "@/components/ui/Button";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { welcomeContent } from "@/data/home";

export function WelcomeSection() {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={welcomeContent.eyebrow}
            title={welcomeContent.title}
            description={welcomeContent.description}
          />
          <Button href={welcomeContent.action.href} className="mt-8">
            {welcomeContent.action.label}
          </Button>
        </div>

        <div
          role="img"
          aria-label="School photography placeholder"
          className="pattern-checker relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[1.625rem] border border-curry-orange/10 sm:min-h-[360px]"
        >
          <div
            className="absolute -top-16 -right-16 size-52 rounded-full bg-curry-orange/10"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -left-20 size-64 rounded-full bg-curry/10"
            aria-hidden="true"
          />
          <div className="relative flex size-24 items-center justify-center rounded-[1.75rem] bg-white text-curry-orange shadow-card">
            <ContentIcon name="school" className="size-11" />
          </div>
        </div>
      </Container>
    </section>
  );
}
