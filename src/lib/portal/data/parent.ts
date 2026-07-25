import "server-only";

import { mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import {
  mockTransportAssignments,
  mockTransportRoutes,
  mockTransportTrips,
} from "@/data/portal/transport";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import type {
  Invoice,
  Payment,
  TransportAssignment,
  TransportRoute,
  TransportTrip,
} from "@/types/portal";

async function parentChildIds(): Promise<Set<string>> {
  const context = await getMockParentPortalContext();
  return new Set((context?.students ?? []).map((student) => student.id));
}

export async function getParentInvoices(): Promise<readonly Invoice[]> {
  if (useRealPortalAuth) {
    const data = await portalApiGet<{ invoices?: Invoice[] }>(
      "/me/invoices",
      {},
    );
    return data.invoices ?? [];
  }
  const ids = await parentChildIds();
  return mockInvoices.filter((invoice) => ids.has(invoice.studentId));
}

export async function getParentPayments(): Promise<readonly Payment[]> {
  if (useRealPortalAuth) {
    const data = await portalApiGet<{ payments?: Payment[] }>(
      "/me/payments",
      {},
    );
    return data.payments ?? [];
  }
  const ids = await parentChildIds();
  return mockPayments.filter((payment) => ids.has(payment.studentId));
}

export type ParentTransportEntry = {
  readonly assignment: TransportAssignment;
  readonly route: TransportRoute | null;
  readonly latestTrip: TransportTrip | null;
};

export async function getParentTransport(): Promise<
  readonly ParentTransportEntry[]
> {
  if (useRealPortalAuth) {
    const data = await portalApiGet<{
      assignments?: {
        assignment: TransportAssignment;
        route: TransportRoute | null;
        latestTrip: TransportTrip | null;
      }[];
    }>("/me/transport", {});
    return (data.assignments ?? []).map((entry) => ({
      assignment: entry.assignment,
      route: entry.route,
      latestTrip: entry.latestTrip,
    }));
  }

  const ids = await parentChildIds();
  return mockTransportAssignments
    .filter((assignment) => ids.has(assignment.studentId))
    .map((assignment) => ({
      assignment,
      route:
        mockTransportRoutes.find((route) => route.id === assignment.routeId) ??
        null,
      latestTrip:
        mockTransportTrips.find((trip) => trip.routeId === assignment.routeId) ??
        null,
    }));
}
