import "server-only";

import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type { PortalDocument, PortalNotification } from "@/types/portal";

// The parent Documents/Notifications surfaces are new; when the real backend is
// off these small static samples keep the pages meaningful.
const fallbackDocuments: readonly PortalDocument[] = [
  { id: "doc-bill", title: "Admission Bill Breakdown", description: "Itemized bill for the new academic year.", category: "bill", audience: "parent", downloadable: true, publishedAt: "2024-08-20" },
  { id: "doc-receipt", title: "Payment Receipt", description: "Receipt for your latest school fees payment.", category: "receipt", audience: "parent", downloadable: true, publishedAt: "2024-09-05" },
  { id: "doc-menu", title: "Term 1 Feeding Menu", description: "Weekly breakfast and lunch menu.", category: "menu", audience: "all", downloadable: false, publishedAt: "2024-09-01" },
  { id: "doc-calendar", title: "School Calendar 2024/25", description: "Term dates and community events.", category: "calendar", audience: "all", downloadable: false, publishedAt: "2024-08-15" },
];

const fallbackNotifications: readonly PortalNotification[] = [
  { id: "note-fees", title: "Fees reminder", body: "A Term 1 balance is outstanding. Please complete payment before the due date.", audience: "parent", priority: "important", read: false, createdAt: "2024-09-10" },
  { id: "note-pta", title: "PTA meeting", body: "End-of-term PTA meeting this Friday at 10:00am in the school hall.", audience: "all", priority: "normal", read: false, createdAt: "2024-09-08" },
];

export async function getParentDocuments(): Promise<readonly PortalDocument[]> {
  if (!useRealPortalAuth) return fallbackDocuments;
  const data = await portalApiGet<{ documents?: PortalDocument[] }>(
    "/me/documents",
    {},
  );
  return data.documents ?? [];
}

// Admin document management: the full list (all audiences), incl. non-downloadable.
export async function listCmsDocuments(): Promise<readonly PortalDocument[]> {
  const data = await portalApiGet<{ documents?: PortalDocument[] }>(
    "/documents",
    {},
  );
  return data.documents ?? [];
}

export async function getPortalNotifications(): Promise<
  readonly PortalNotification[]
> {
  if (!useRealPortalAuth) return fallbackNotifications;
  const data = await portalApiGet<{ notifications?: PortalNotification[] }>(
    "/me/notifications",
    {},
  );
  return data.notifications ?? [];
}
