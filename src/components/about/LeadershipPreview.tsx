import { Button } from "@/components/ui/Button";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { leadershipProfiles } from "@/data/about";
import { routes } from "@/lib/routes";

export function LeadershipPreview() {
  return (
    <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            eyebrow="Our Team"
            title="Leadership & management"
            description="A coordinated leadership team supports teaching, wellbeing and the daily life of the school."
          />
          <Button href={routes.leadership} variant="secondary">
            Meet Our Leadership
          </Button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {leadershipProfiles.slice(0, 3).map((profile) => (
            <article
              key={profile.title}
              className="rounded-card border border-border bg-white p-7 shadow-card"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
                <ContentIcon name={profile.icon} className="size-7" />
              </div>
              <p className="mt-6 text-sm font-extrabold tracking-[0.12em] text-curry-orange uppercase">
                {profile.role}
              </p>
              <h3 className="mt-2 text-xl font-bold text-charcoal">
                {profile.title}
              </h3>
              <p className="mt-3 leading-7 text-muted-grey">
                {profile.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
