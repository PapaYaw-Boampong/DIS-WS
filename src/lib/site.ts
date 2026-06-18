import { school } from "@/data/school";

const fallbackSiteUrl = "https://www.divineschool.edu.gh";

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim() || fallbackSiteUrl;

  try {
    return new URL(candidate).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export const siteConfig = {
  name: school.name,
  shortName: school.shortName,
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  description:
    "A nurturing school community committed to academic excellence, discipline and character development.",
  locale: "en_GH",
  socialImage: "/images/brand/dis-logo.png",
} as const;

export function siteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
