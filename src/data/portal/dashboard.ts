import type { DashboardAlert } from "@/types/portal";

export const mockAdminSummary = {
  totalStudents: 486,
  totalParents: 362,
  totalStaff: 58,
  attendancePercentage: 95,
  recentAdmissions: 12,
  activeClasses: 18,
} as const;

export const mockAccountsSummary = {
  expectedFees: 842_500,
  receivedPayments: 615_300,
  outstandingBalance: 227_200,
  paymentsToday: 18_750,
  pendingConfirmations: 7,
  paidInvoices: 318,
} as const;

export const mockAdminAlerts = [
  {
    id: "alert-001",
    title: "Attendance review",
    description: "Three classes are below the mock 90% attendance threshold.",
    severity: "warning",
  },
  {
    id: "alert-002",
    title: "Admissions records",
    description: "Twelve mock admission records await administrative review.",
    severity: "info",
  },
  {
    id: "alert-003",
    title: "Backend not connected",
    description:
      "Dashboard totals are fictional and do not represent live school records.",
    severity: "critical",
  },
] satisfies readonly DashboardAlert[];

export const mockAccountsAlerts = [
  {
    id: "accounts-alert-001",
    title: "Pending confirmations",
    description:
      "Seven fictional transactions are marked for later reconciliation.",
    severity: "warning",
  },
  {
    id: "accounts-alert-002",
    title: "Mock financial data",
    description:
      "No payment provider, bank feed or accounting database is connected.",
    severity: "info",
  },
] satisfies readonly DashboardAlert[];
