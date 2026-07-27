"use server";

import {
  portalApiPost,
  portalApiSend,
  useRealPortalAuth,
} from "@/lib/portal/data/api";

export type DocumentActionResult = {
  readonly ok: boolean;
  readonly error?: string;
};

export type DocumentUploadInput = {
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly audience: "all" | "parent" | "staff" | "student";
  readonly downloadable: boolean;
  readonly fileName: string;
  readonly mimeType: string;
  readonly dataBase64: string;
};

export async function uploadDocument(
  input: DocumentUploadInput,
): Promise<DocumentActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiPost<{ error?: string }>("/documents", input);
  return {
    ok: result.ok,
    error: result.ok
      ? undefined
      : result.data?.error === "invalid_size"
        ? "file_too_large"
        : "upload_failed",
  };
}

export async function updateDocument(
  id: string,
  input: {
    readonly title?: string;
    readonly description?: string;
    readonly category?: string;
    readonly audience?: "all" | "parent" | "staff" | "student";
    readonly downloadable?: boolean;
  },
): Promise<DocumentActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiSend(
    "PATCH",
    `/documents/${encodeURIComponent(id)}`,
    input,
  );
  return { ok: result.ok, error: result.ok ? undefined : "save_failed" };
}

export async function deleteDocument(
  id: string,
): Promise<DocumentActionResult> {
  if (!useRealPortalAuth) return { ok: false, error: "backend_required" };
  const result = await portalApiSend(
    "DELETE",
    `/documents/${encodeURIComponent(id)}`,
  );
  return { ok: result.ok, error: result.ok ? undefined : "delete_failed" };
}
