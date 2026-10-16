import "server-only";

import {
  mockAccountsAlerts,
  mockAccountsSummary,
  mockAdminAlerts,
  mockAdminSummary,
} from "@/data/portal/dashboard";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";

export type DashboardAlert = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: "info" | "warning" | "critical";
};

export type SchoolSummary = {
  readonly totalStudents: number;
  readonly totalParents: number;
  readonly totalStaff: number;
  readonly activeClasses: number;
  readonly recentAdmissions: number;
  readonly attendancePercentage: number;
};

export type FinanceSummary = {
  readonly expectedFees: number;
  readonly receivedPayments: number;
  readonly outstandingBalance: number;
  readonly paymentsToday: number;
  readonly pendingConfirmations: number;
  readonly paidInvoices: number;
  readonly overdueInvoices: number;
  readonly overdueAmount: number;
  readonly receivedByCategory: readonly {
    readonly category: string;
    readonly received: number;
  }[];
};

export type DashboardSummary = {
  readonly school: SchoolSummary;
  readonly finance: FinanceSummary;
  readonly alerts: readonly DashboardAlert[];
  // The dashboards label their own numbers, and the honest label differs: real
  // counts versus the illustrative figures shown with no backend.
  readonly isLive: boolean;
};

const mockSummary: DashboardSummary = {
  school: {
    totalStudents: mockAdminSummary.totalStudents,
    totalParents: mockAdminSummary.totalParents,
    totalStaff: mockAdminSummary.totalStaff,
    activeClasses: mockAdminSummary.activeClasses,
    recentAdmissions: mockAdminSummary.recentAdmissions,
    attendancePercentage: mockAdminSummary.attendancePercentage,
  },
  finance: {
    expectedFees: mockAccountsSummary.expectedFees,
    receivedPayments: mockAccountsSummary.receivedPayments,
    outstandingBalance: mockAccountsSummary.outstandingBalance,
    paymentsToday: mockAccountsSummary.paymentsToday,
    pendingConfirmations: mockAccountsSummary.pendingConfirmations,
    paidInvoices: mockAccountsSummary.paidInvoices,
    overdueInvoices: 0,
    overdueAmount: 0,
    receivedByCategory: [
      { category: "school_fees", received: 467_600 },
      { category: "feeding", received: 92_100 },
      { category: "transport", received: 55_600 },
    ],
  },
  alerts: [...mockAdminAlerts, ...mockAccountsAlerts] as DashboardAlert[],
  isLive: false,
};

/**
 * School-wide counts, finance totals and derived alerts for the admin and
 * accounts dashboards. Every figure is counted from the database in real mode;
 * with no backend these stay the illustrative mock numbers and `isLive` is
 * false so the UI can say which it is showing.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!useRealPortalAuth) return mockSummary;

  const data = await portalApiGet<Partial<DashboardSummary>>(
    "/dashboard/summary",
    {},
  );

  if (!data.school || !data.finance) return mockSummary;

  return {
    school: data.school,
    finance: { ...data.finance, receivedByCategory: data.finance.receivedByCategory ?? [] },
    alerts: data.alerts ?? [],
    isLive: true,
  };
}

export type StaffWorkload = {
  readonly registersTaken: number;
  readonly registersExpected: number;
  readonly assignmentsGraded: number;
  readonly assignmentsTotal: number;
  readonly materialsShared: number;
  readonly classCount: number;
  readonly isLive: boolean;
};

const mockWorkload: StaffWorkload = {
  registersTaken: 3,
  registersExpected: 4,
  assignmentsGraded: 3,
  assignmentsTotal: 5,
  materialsShared: 4,
  classCount: 4,
  isLive: false,
};

// The signed-in teacher's own week, scoped server-side to their classes.
export async function getStaffWorkload(): Promise<StaffWorkload> {
  if (!useRealPortalAuth) return mockWorkload;

  const data = await portalApiGet<Partial<StaffWorkload>>(
    "/dashboard/staff-workload",
    {},
  );

  if (typeof data.registersExpected !== "number") return mockWorkload;

  return {
    registersTaken: data.registersTaken ?? 0,
    registersExpected: data.registersExpected,
    assignmentsGraded: data.assignmentsGraded ?? 0,
    assignmentsTotal: data.assignmentsTotal ?? 0,
    materialsShared: data.materialsShared ?? 0,
    classCount: data.classCount ?? 0,
    isLive: true,
  };
}
