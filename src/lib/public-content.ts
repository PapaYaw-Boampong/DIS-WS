import "server-only";

import { calendarEvents, featuredEvents } from "@/data/events";
import { featuredNews, newsArticles } from "@/data/news";
import { academicTerms } from "@/data/academics";
import { toContentIcon } from "@/lib/content-icons";
import { routes } from "@/lib/routes";
import type { AcademicTerm, EventItem, NewsArticle } from "@/types/content";

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

type BackendNews = {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly icon: string;
  readonly publishedLabel: string;
  readonly imageDescription: string;
  readonly body: NewsArticle["body"];
};

type BackendEvent = {
  readonly title: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly icon: string;
  readonly featured: boolean;
};

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
    // CMS content is text + icon based; authored photography stays static.
  };
}

function mapEvent(event: BackendEvent): EventItem {
  return {
    title: event.title,
    date: event.dateLabel,
    description: event.description,
    href: routes.calendar,
    icon: toContentIcon(event.icon, "calendar"),
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
