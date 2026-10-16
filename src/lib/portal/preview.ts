import "server-only";

import { useRealPortalAuth } from "@/lib/portal/auth-config";

// Development copy — "mock data" badges, phase notes, planned-feature markers —
// belongs to the preview build only. Once the portal runs on real sessions none
// of it may reach a school user, so every surface that renders that copy checks
// this flag first.
export const portalPreviewMode = !useRealPortalAuth;

// Sentences that only make sense while the portal is a preview: they name the
// mock data, the build phase, or the services that are not wired up yet.
const previewSentence =
  /\b(mock|mocked|fictional|placeholder|preview|demo|phase\s*\d|no\s+(?:live\s+)?(?:backend|gps|map provider|payment provider|database|notification)|not connected|unsaved|frontend|browser only|kept in your browser)\b/i;

/**
 * Strips development-only sentences from user-facing copy when the portal is
 * running against real sessions. Returns undefined when nothing is left, so the
 * caller can skip the paragraph entirely.
 */
export function previewText(text?: string): string | undefined {
  if (!text || portalPreviewMode) {
    return text;
  }

  const kept = text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !previewSentence.test(sentence));

  return kept.length ? kept.join(" ") : undefined;
}
