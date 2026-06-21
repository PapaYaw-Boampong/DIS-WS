import { school } from "@/data/school";

export const whatsappGroups = [
  {
    title: "Early Years Families",
    description:
      "Request access to the moderated Early Years family updates group.",
  },
  {
    title: "Primary Families",
    description:
      "Request access to the moderated Primary family updates group.",
  },
  {
    title: "Junior High Families",
    description:
      "Request access to the moderated Junior High family updates group.",
  },
] as const;

const configuredSocialLinks = [
  {
    platform: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
  },
  {
    platform: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  },
  {
    platform: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  },
  {
    platform: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL,
  },
] as const;

export const socialLinks = configuredSocialLinks.filter(
  (link): link is { platform: (typeof link)["platform"]; href: string } =>
    Boolean(link.href?.trim()),
);

export function whatsappRequestHref(groupTitle: string) {
  const message = encodeURIComponent(
    `Hello Divine International School. I would like to request access to the ${groupTitle} WhatsApp group. Please let me know the verification steps.`,
  );

  return `https://wa.me/${school.whatsappNumber}?text=${message}`;
}
