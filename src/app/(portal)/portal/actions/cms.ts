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

// A post's image is either a built-in gallery id or an uploaded ref; passing
// null clears it.
export type ImageSelection = {
  readonly imageId?: string | null;
  readonly imageObjectKey?: string | null;
  readonly imageAlt?: string | null;
};

// Uploads an image and returns its ref (stored as imageObjectKey on a post).
export async function uploadCmsImage(input: {
  readonly fileName: string;
  readonly mimeType: string;
  readonly dataBase64: string;
}): Promise<{ ok: boolean; ref?: string; error?: string }> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiPost<{ ref?: string; error?: string }>(
    "/cms/images",
    input,
  );
  return {
    ok: result.ok,
    ref: result.data?.ref,
    error: result.ok ? undefined : (result.data?.error ?? "upload_failed"),
  };
}

// --- News ------------------------------------------------------------------

export type NewsInput = ImageSelection & {
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

export type EventInput = ImageSelection & {
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

// --- Calendar PDF ----------------------------------------------------------

export type CalendarPdfInput = {
  readonly fileName: string;
  readonly mimeType: string;
  readonly dataBase64: string;
  readonly status: "draft" | "published";
};

export async function uploadCalendarPdf(
  input: CalendarPdfInput,
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiPost<{ document?: { id: string }; error?: string }>(
    "/cms/calendar/pdf",
    input,
  );
  if (result.ok) revalidatePublicContent();
  return {
    ok: result.ok,
    mode: "real",
    error: result.ok
      ? undefined
      : result.data?.error === "invalid_size"
        ? "file_too_large"
        : result.data?.error === "pdf_required"
          ? "pdf_required"
          : "save_failed",
    id: result.data?.document?.id,
  };
}

export async function setCalendarPdfStatus(
  status: "draft" | "published",
): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("PATCH", "/cms/calendar/pdf", { status });
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "save_failed" };
}

export async function deleteCalendarPdf(): Promise<CmsActionResult> {
  if (!useRealPortalAuth) return mockResult;
  const result = await portalApiSend("DELETE", "/cms/calendar/pdf");
  if (result.ok) revalidatePublicContent();
  return { ok: result.ok, mode: "real", error: result.ok ? undefined : "delete_failed" };
}
