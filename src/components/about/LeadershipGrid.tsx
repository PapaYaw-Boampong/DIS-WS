import { AboutImagePlaceholder } from "@/components/about/AboutImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { leadershipProfiles } from "@/data/about";
import type { LeaderProfile } from "@/types/content";

type LeadershipGridProps = {
  profiles?: readonly LeaderProfile[];
  showHeader?: boolean;
};

export function LeadershipGrid({
  profiles = leadershipProfiles,
  showHeader = true,
}: LeadershipGridProps) {
  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        {showHeader ? (
          <SectionHeader
            eyebrow="Leadership"
            title="Guiding our school community"
            description="Leadership roles work together to support strong learning, pupil care and reliable school operations."
          />
        ) : null}
        <div
          className={
            showHeader
              ? "mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
              : "grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          }
        >
          {profiles.map((profile) => (
            <article
              key={profile.title}
              className="overflow-hidden rounded-card border border-border bg-white shadow-card"
            >
              <AboutImagePlaceholder
                label={profile.title}
                description={profile.imageDescription}
                icon={profile.icon}
                image={profile.image}
                aspect="square"
                className="rounded-none border-0 border-b border-border"
              />
              <div className="p-6">
                <p className="text-sm font-extrabold tracking-[0.12em] text-curry-orange uppercase">
                  {profile.role}
                </p>
                <h3 className="mt-2 text-xl font-bold text-charcoal">
                  {profile.title}
                </h3>
                <p className="mt-3 leading-7 text-muted-grey">
                  {profile.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
