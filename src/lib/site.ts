import { school } from "@/data/school";

const fallbackSiteUrl = "https://www.divineschool.edu.gh";

function normalizeSiteUrl(value: string | undefined) {
  const rawValue = value?.trim();
  const candidate = rawValue
    ? /^https?:\/\//i.test(rawValue)
      ? rawValue
      : `https://${rawValue}`
    : fallbackSiteUrl;

  try {
    return new URL(candidate).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

export const siteConfig = {
  name: school.name,
  shortName: school.shortName,
  url: normalizeSiteUrl(deploymentUrl),
  description:
    "A nurturing school community committed to academic excellence, discipline and character development.",
  locale: "en_GH",
  socialImage: "/images/brand/dis-logo.png",
} as const;

export function siteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
