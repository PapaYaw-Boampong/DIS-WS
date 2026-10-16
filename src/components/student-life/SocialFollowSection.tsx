import { ArrowUpRight, Camera, Music2 } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { socialLinks } from "@/data/community";
import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";

const platforms = [
  { platform: "Instagram", icon: Camera },
  { platform: "TikTok", icon: Music2 },
] as const;

// A taste of what the school posts: celebrations, performances and events.
const feedPreview = [
  siteImages.socialCapToss,
  siteImages.dance,
  siteImages.colourDay,
  siteImages.careerDay,
];

// "@handle" from a profile URL such as instagram.com/name or tiktok.com/@name.
function handleFrom(href: string): string | null {
  try {
    const segment = new URL(href).pathname.split("/").filter(Boolean)[0];
    return segment ? `@${segment.replace(/^@/, "")}` : null;
  } catch {
    return null;
  }
}

export function SocialFollowSection() {
  return (
    <section className="overflow-hidden bg-charcoal py-20 text-white sm:py-24 lg:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <p className="text-sm font-extrabold tracking-[0.18em] text-curry-orange uppercase">
            Follow Us
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
            See school life as it happens
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-soft-white/85">
            Visit our Instagram and TikTok for graduation moments,
            performances, Career Day, Colour Day and everyday life on campus.
            Follow us so you never miss a celebration.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {platforms.map(({ platform, icon: Icon }) => {
              const href = socialLinks.find(
                (link) => link.platform === platform,
              )?.href;
              const handle = href ? handleFrom(href) : null;
              const content = (
                <>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-curry-orange text-white">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="flex flex-col text-left">
                    <span className="font-bold">
                      {href ? `Follow on ${platform}` : platform}
                    </span>
                    <span className="text-sm text-soft-white/70">
                      {handle ?? "Divine International School"}
                    </span>
                  </span>
                  {href ? (
                    <ArrowUpRight
                      aria-hidden="true"
                      className="ml-auto size-5 text-soft-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  ) : null}
                </>
              );
              const className =
                "group flex min-w-60 items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3";

              return href ? (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    className,
                    "transition-colors hover:border-curry-orange hover:bg-white/10",
                  )}
                >
                  {content}
                </a>
              ) : (
                <div key={platform} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        <div aria-hidden="true" className="grid grid-cols-2 gap-4 sm:gap-5">
          {feedPreview.map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "relative aspect-square overflow-hidden rounded-card shadow-card-strong",
                index % 2 === 1 && "translate-y-6 sm:translate-y-10",
              )}
            >
              <ResponsiveImage
                image={image}
                sizes="(min-width: 1024px) 25vw, 50vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
