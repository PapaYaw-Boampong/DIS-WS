import "server-only";

import { mockReportCards } from "@/data/portal/report-cards";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type { ReportCard } from "@/types/portal";

// Report cards for the signed-in student, or for every child linked to the
// signed-in parent. Drafts are filtered out by the caller for families.
export async function getMyReportCards(): Promise<readonly ReportCard[]> {
  if (!useRealPortalAuth) return mockReportCards;
  return (
    await portalApiGet<{ reportCards?: ReportCard[] }>("/me/report-cards", {})
  ).reportCards ?? [];
}

// Every report card the school holds — used by the staff/admin publishing view.
export async function listReportCards(): Promise<readonly ReportCard[]> {
  if (!useRealPortalAuth) return mockReportCards;
  return (
    await portalApiGet<{ reportCards?: ReportCard[] }>("/report-cards", {})
  ).reportCards ?? [];
}

export function publishedReportCards(
  cards: readonly ReportCard[],
): readonly ReportCard[] {
  return cards.filter((card) => card.status === "published");
}

// Newest term first, so the current report card opens by default.
export function sortReportCards(
  cards: readonly ReportCard[],
): readonly ReportCard[] {
  return cards.toSorted((first, second) => {
    const year = second.academicYear.localeCompare(first.academicYear);
    return year !== 0 ? year : second.term.localeCompare(first.term);
  });
}
