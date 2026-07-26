import "server-only";

import { portalApiGet } from "@/lib/portal/data/api";

// Admin-facing CMS reads (include drafts). These require an admin session
// token; with the flag off / no backend they resolve to empty lists and the
// managers render an informative empty state.

export type CmsNewsBodySection = {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
};

export type CmsNewsPost = {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly icon: string;
  readonly publishedLabel: string;
  readonly imageDescription: string;
  readonly body: readonly CmsNewsBodySection[];
  readonly status: "draft" | "published";
  readonly publishedAt: string | null;
  readonly updatedAt: string;
};

export type CmsEventPost = {
  readonly id: string;
  readonly title: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly icon: string;
  readonly featured: boolean;
  readonly status: "draft" | "published";
  readonly position: number;
  readonly updatedAt: string;
};

export type CmsCalendarTerm = {
  readonly id: string;
  readonly name: string;
  readonly period: string;
  readonly description: string;
  readonly highlights: readonly string[];
  readonly status: "draft" | "published";
  readonly position: number;
  readonly updatedAt: string;
};

export async function listCmsNews(): Promise<readonly CmsNewsPost[]> {
  return (
    await portalApiGet<{ news?: CmsNewsPost[] }>("/cms/news", {})
  ).news ?? [];
}

export async function getCmsNewsPost(
  id: string,
): Promise<CmsNewsPost | undefined> {
  const news = await listCmsNews();
  return news.find((post) => post.id === id);
}

export async function listCmsEvents(): Promise<readonly CmsEventPost[]> {
  return (
    await portalApiGet<{ events?: CmsEventPost[] }>("/cms/events", {})
  ).events ?? [];
}

export async function listCmsCalendar(): Promise<readonly CmsCalendarTerm[]> {
  return (
    await portalApiGet<{ terms?: CmsCalendarTerm[] }>("/cms/calendar", {})
  ).terms ?? [];
}

export type CmsCalendarDocument = {
  readonly id: string;
  readonly fileName: string;
  readonly status: "draft" | "published";
  readonly updatedAt: string;
};

export async function getCmsCalendarPdf(): Promise<CmsCalendarDocument | null> {
  return (
    await portalApiGet<{ document?: CmsCalendarDocument | null }>(
      "/cms/calendar/pdf",
      {},
    )
  ).document ?? null;
}
