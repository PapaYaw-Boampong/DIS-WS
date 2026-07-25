"use server";

import { revalidatePath } from "next/cache";

import {
  portalApiPost,
  portalApiSend,
  useRealPortalAuth,
} from "@/lib/portal/data/api";

export type CmsActionResult = {
  readonly ok: boolean;
  readonly mode: "mock" | "real";
  readonly error?: string;
  readonly id?: string;
  readonly slug?: string;
};

// Portal-managed content feeds the public marketing site. After any successful
// write we revalidate the public routes that render CMS content so admin edits
// appear on the live site immediately (rather than waiting for the ISR window).
function revalidatePublicContent(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/calendar");
  revalidatePath("/academics");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/news/${slug}`);
}

const mockResult: CmsActionResult = {
  ok: false,
  mode: "mock",
  error: "backend_required",
};

// --- News ------------------------------------------------------------------

export type NewsInput = {
  readonly title: string;
  readonly slug?: string;
  readonly excerpt: string;
  readonly category: string;
  readonly icon: string;
  readonly publishedLabel: string;
  readonly imageDescription: string;
  readonly body: ReadonlyArray<{
    readonly heading?: string;
    readonly paragraphs: readonly string[];
  }>;
  readonly status: "draft" | "published";
};

export async function createNews(input: NewsInput): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiPost<{
    article?: { id: string; slug: string };
    error?: string;
  }>("/cms/news", input);
  if (result.ok) revalidatePublicContent(result.data?.article?.slug);
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "save_failed"),
    id: result.data?.article?.id,
    slug: result.data?.article?.slug,
  };
}

export async function updateNews(
  id: string,
  input: Partial<NewsInput>,
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend<{
    article?: { slug: string };
    error?: string;
  }>("PATCH", `/cms/news/${encodeURIComponent(id)}`, input);
  if (result.ok) revalidatePublicContent(result.data?.article?.slug);
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "save_failed"),
    slug: result.data?.article?.slug,
  };
}

export async function deleteNews(id: string): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("DELETE", `/cms/news/${encodeURIComponent(id)}`);
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "delete_failed" };
}

// --- Events ----------------------------------------------------------------

export type EventInput = {
  readonly title: string;
  readonly dateLabel: string;
  readonly description: string;
  readonly icon: string;
  readonly featured: boolean;
  readonly status: "draft" | "published";
  readonly position: number;
};

export async function createEvent(input: EventInput): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiPost<{ event?: { id: string }; error?: string }>(
    "/cms/events",
    input,
  );
  if (result.ok) revalidatePublicContent();
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "save_failed"),
    id: result.data?.event?.id,
  };
}

export async function updateEvent(
  id: string,
  input: Partial<EventInput>,
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("PATCH", `/cms/events/${encodeURIComponent(id)}`, input);
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "save_failed" };
}

export async function deleteEvent(id: string): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("DELETE", `/cms/events/${encodeURIComponent(id)}`);
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "delete_failed" };
}

// --- Calendar terms --------------------------------------------------------

export type CalendarInput = {
  readonly name: string;
  readonly period: string;
  readonly description: string;
  readonly highlights: readonly string[];
  readonly status: "draft" | "published";
  readonly position: number;
};

export async function createCalendarTerm(
  input: CalendarInput,
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiPost<{ term?: { id: string }; error?: string }>(
    "/cms/calendar",
    input,
  );
  if (result.ok) revalidatePublicContent();
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok ? undefined : (result.data?.error ?? "save_failed"),
    id: result.data?.term?.id,
  };
}

export async function updateCalendarTerm(
  id: string,
  input: Partial<CalendarInput>,
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("PATCH", `/cms/calendar/${encodeURIComponent(id)}`, input);
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "save_failed" };
}

export async function deleteCalendarTerm(id: string): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("DELETE", `/cms/calendar/${encodeURIComponent(id)}`);
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "delete_failed" };
}
