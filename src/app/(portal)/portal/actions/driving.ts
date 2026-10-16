"use server";

import { portalApiGet, portalApiPost, useRealPortalAuth } from "@/lib/portal/data/api";

// Position sharing from the driver's phone. The browser owns the GPS; these
// actions only relay what it reports.

export type DriverRoute = {
  readonly id: string;
  readonly routeName: string;
  readonly busName: string;
  readonly assignedToMe: boolean;
};

export async function getDriverRoutes(): Promise<readonly DriverRoute[]> {
  if (!useRealPortalAuth) return [];
  const data = await portalApiGet<{ routes?: DriverRoute[] }>(
    "/me/transport/routes",
    {},
  );
  return data.routes ?? [];
}

export type ShareResult = {
  readonly ok: boolean;
  readonly error?: string;
};

export async function shareDriverPosition(input: {
  readonly routeId: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly speedKph?: number;
  readonly accuracyM?: number;
  readonly recordedAt?: string;
}): Promise<ShareResult> {
  if (!useRealPortalAuth) {
    return { ok: false, error: "no_backend" };
  }

  const result = await portalApiPost("/me/transport/position", input);

  if (!result.ok) {
    return {
      ok: false,
      error: result.status === 403 ? "not_your_route" : "send_failed",
    };
  }

  return { ok: true };
}

export async function stopSharingPosition(routeId: string): Promise<ShareResult> {
  if (!useRealPortalAuth) return { ok: false, error: "no_backend" };
  const result = await portalApiPost("/me/transport/position/stop", { routeId });
  return { ok: result.ok };
}
