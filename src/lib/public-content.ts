import "server-only";

import { calendarEvents, featuredEvents } from "@/data/events";
import { featuredNews, newsArticles } from "@/data/news";
import { academicTerms } from "@/data/academics";
import { toContentIcon } from "@/lib/content-icons";
import { imageById } from "@/lib/images";
import { routes } from "@/lib/routes";
import type {
  AcademicTerm,
  EventItem,
  NewsArticle,
  SiteImage,
} from "@/types/content";

// Public-website content layer. When USE_REAL_PUBLIC_CONTENT is enabled the
// marketing site reads portal-managed content from the backend's public
// endpoints (ISR-cached); otherwise — and on ANY fetch failure — it falls back
// to the typed static content, so the site always renders even with no backend.
// This mirrors the portal's USE_REAL_PORTAL_AUTH repository pattern.

const useRealPublicContent = process.env.USE_REAL_PUBLIC_CONTENT === "true";
const apiUrl = process.env.PORTAL_API_URL ?? "http://localhost:4000";
const REVALIDATE_SECONDS = 60;

async function fetchPublic<T>(path: string): Promise<T | null> {
  if (!useRealPublicContent) return null;
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

type BackendImageFields = {
  readonly imageId?: string | null;
  readonly imageObjectKey?: string | null;
  readonly imageAlt?: string | null;
};

type BackendNews = BackendImageFields & {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly icon: string;
  readonly publishedLabel: string;
  readonly imageDescription: string;
  readonly body: NewsArticle["body"];
};

type BackendEvent = BackendImageFields & {
  readonly title: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly icon: string;
  readonly featured: boolean;
};

// Resolves a post's image: a gallery `imageId` renders through the optimized
// pipeline (SiteImage); an uploaded `imageObjectKey` renders via the same-origin
// proxy. At most one is set.
function resolveImage(fields: BackendImageFields): {
  image?: SiteImage;
  imageUrl?: string;
  imageAlt?: string;
} {
  if (fields.imageId) {
    const galleryImage = (imageById as Record<string, SiteImage | undefined>)[
      fields.imageId
    ];
    if (galleryImage) return { image: galleryImage };
  }
  if (fields.imageObjectKey) {
    return {
      imageUrl: `/cms-image/${fields.imageObjectKey}`,
      imageAlt: fields.imageAlt ?? undefined,
    };
  }
  return {};
}

function mapNews(post: BackendNews): NewsArticle {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedLabel,
    category: post.category,
    icon: toContentIcon(post.icon, "newspaper"),
    imageDescription: post.imageDescription,
    body: post.body,
    ...resolveImage(post),
  };
}

function mapEvent(event: BackendEvent): EventItem {
  return {
    title: event.title,
    date: event.dateLabel,
    description: event.description,
    href: routes.calendar,
    icon: toContentIcon(event.icon, "calendar"),
    ...resolveImage(event),
  };
}

export async function getPublishedNews(): Promise<readonly NewsArticle[]> {
  const data = await fetchPublic<{ news: BackendNews[] }>("/public/news");
  return data ? data.news.map(mapNews) : newsArticles;
}

export async function getFeaturedNews(): Promise<readonly NewsArticle[]> {
  const data = await fetchPublic<{ news: BackendNews[] }>("/public/news");
  if (!data) return featuredNews;
  return data.news.slice(0, 1).map(mapNews);
}

export async function getPublishedNewsArticle(
  slug: string,
): Promise<NewsArticle | undefined> {
  // Derive from the published list so "not found" is unambiguous and a
  // transient error falls back to static rather than a spurious 404.
  const news = await getPublishedNews();
  return news.find((article) => article.slug === slug);
}

export async function getPublishedEvents(): Promise<readonly EventItem[]> {
  const data = await fetchPublic<{ events: BackendEvent[] }>("/public/events");
  return data ? data.events.map(mapEvent) : calendarEvents;
}

export async function getFeaturedEvents(): Promise<readonly EventItem[]> {
  const data = await fetchPublic<{ events: BackendEvent[] }>("/public/events");
  if (!data) return featuredEvents;
  const featured = data.events.filter((event) => event.featured).map(mapEvent);
  return featured.length > 0 ? featured : data.events.slice(0, 1).map(mapEvent);
}

export async function getCalendarPdf(): Promise<{
  hasPdf: boolean;
  url: string;
}> {
  const data = await fetchPublic<{ hasPdf: boolean }>(
    "/public/calendar/pdf/meta",
  );
  return { hasPdf: Boolean(data?.hasPdf), url: "/calendar/pdf" };
}

export async function getPublishedCalendarTerms(): Promise<
  readonly AcademicTerm[]
> {
  const data = await fetchPublic<{ terms: AcademicTerm[] }>("/public/calendar");
  if (!data) return academicTerms;
  return data.terms.map((term) => ({
    name: term.name,
    period: term.period,
    description: term.description,
    highlights: term.highlights,
  }));
}
