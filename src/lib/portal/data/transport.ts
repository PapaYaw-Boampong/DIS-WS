import "server-only";

import {
  mockTransportAssignments,
  mockTransportRoutes,
  mockTransportTrips,
} from "@/data/portal/transport";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type {
  TransportAssignment,
  TransportRoute,
  TransportTrip,
} from "@/types/portal";

// Admin / accounts / transport scoped reads.
export async function listTransportRoutes(): Promise<
  readonly TransportRoute[]
> {
  if (!useRealPortalAuth) return mockTransportRoutes;
  return (
    await portalApiGet<{ routes?: TransportRoute[] }>("/transport/routes", {})
  ).routes ?? [];
}

export async function listTransportTrips(): Promise<readonly TransportTrip[]> {
  if (!useRealPortalAuth) return mockTransportTrips;
  return (
    await portalApiGet<{ trips?: TransportTrip[] }>("/transport/trips", {})
  ).trips ?? [];
}

export async function listTransportAssignments(): Promise<
  readonly TransportAssignment[]
> {
  if (!useRealPortalAuth) return mockTransportAssignments;
  return (
    await portalApiGet<{ assignments?: TransportAssignment[] }>(
      "/transport/assignments",
      {},
    )
  ).assignments ?? [];
}
