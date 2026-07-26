import "server-only";

import { mockAnnouncements, mockPortalEvents } from "@/data/portal/announcements";
import { mockTransportNotices } from "@/data/portal/transport";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type {
  PortalAnnouncement,
  PortalEvent,
  TransportNotice,
} from "@/types/portal";

export async function listAnnouncements(): Promise<
  readonly PortalAnnouncement[]
> {
  if (!useRealPortalAuth) return mockAnnouncements;
  return (
    await portalApiGet<{ announcements?: PortalAnnouncement[] }>(
      "/announcements",
      {},
    )
  ).announcements ?? [];
}

export async function listEvents(): Promise<readonly PortalEvent[]> {
  if (!useRealPortalAuth) return mockPortalEvents;
  return (await portalApiGet<{ events?: PortalEvent[] }>("/events", {}))
    .events ?? [];
}

export async function listTransportNotices(): Promise<
  readonly TransportNotice[]
> {
  if (!useRealPortalAuth) return mockTransportNotices;
  return (
    await portalApiGet<{ notices?: TransportNotice[] }>("/transport-notices", {})
  ).notices ?? [];
}
