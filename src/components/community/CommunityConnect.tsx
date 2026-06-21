import {
  Camera,
  MessageCircle,
  Music2,
  Play,
  UsersRound,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  socialLinks,
  whatsappGroups,
  whatsappRequestHref,
} from "@/data/community";

const socialIcons = {
  Facebook: UsersRound,
  Instagram: Camera,
  YouTube: Play,
  TikTok: Music2,
} as const;

export function CommunityConnect() {
  return (
    <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Stay Connected"
          title="Join the Divine school community"
          description="Request access to moderated family WhatsApp groups and follow verified school channels for approved updates."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5 sm:grid-cols-3">
            {whatsappGroups.map((group) => (
              <article
                key={group.title}
                className="flex flex-col rounded-card border border-border bg-white p-6 shadow-card"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e9f9ef] text-[#128c4a]">
                  <MessageCircle
                    aria-hidden="true"
                    className="size-6"
                  />
                </div>
                <h3 className="mt-5 text-xl font-bold text-charcoal">
                  {group.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-grey">
                  {group.description}
                </p>
                <a
                  href={whatsappRequestHref(group.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#128c4a] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0d6f3a]"
                >
                  Request access
                </a>
              </article>
            ))}
          </div>

          <article className="rounded-card border border-border bg-charcoal p-7 text-white shadow-card sm:p-8">
            <p className="text-sm font-extrabold tracking-[0.16em] text-curry-orange uppercase">
              Official Channels
            </p>
            <h3 className="mt-3 text-2xl font-bold">
              Follow Divine online
            </h3>
            <p className="mt-4 leading-7 text-soft-white/75">
              Follow school announcements, achievements, activities and
              community highlights on our verified social pages.
            </p>

            {socialLinks.length ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {socialLinks.map((link) => {
                  const Icon = socialIcons[link.platform];

                  return (
                    <a
                      key={link.platform}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center gap-3 rounded-2xl border border-white/15 px-4 text-sm font-bold transition-colors hover:border-curry-orange hover:text-curry-orange"
                    >
                      <Icon aria-hidden="true" className="size-5" />
                      {link.platform}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="mt-7 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-6 text-soft-white/70">
                Official social links are being connected. Use the school
                contact details to confirm current channels.
              </p>
            )}
          </article>
        </div>
      </Container>
    </section>
  );
}
