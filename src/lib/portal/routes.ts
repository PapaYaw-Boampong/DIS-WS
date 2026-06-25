import type { PortalRole } from "@/types/portal";

export const portalRoutes = {
  landing: "/portal",
  login: "/portal/login",
  dashboard: (role: PortalRole) => `/portal/${role}/dashboard`,
  studentCourses: "/portal/student/courses",
  studentTodo: "/portal/student/todo",
  parentEvents: "/portal/parent/events",
  parentFees: "/portal/parent/fees",
  parentFeesPay: "/portal/parent/fees/pay",
  parentPayments: "/portal/parent/payments",
  parentFeeding: "/portal/parent/feeding",
  parentTransport: "/portal/parent/transport",
  adminTransport: "/portal/admin/transport",
  staffClasses: "/portal/staff/classes",
  staffCourses: "/portal/staff/courses",
  staffAttendance: "/portal/staff/attendance",
  staffAssignments: "/portal/staff/assignments",
  staffGradebook: "/portal/staff/gradebook",
  adminStudents: "/portal/admin/students",
  adminParents: "/portal/admin/parents",
  adminStaff: "/portal/admin/staff",
  adminClasses: "/portal/admin/classes",
  adminFees: "/portal/admin/fees",
  adminBackendReadiness: "/portal/admin/backend-readiness",
  adminDatabaseReadiness: "/portal/admin/database-readiness",
  adminAuthReadiness: "/portal/admin/auth-readiness",
  adminPaymentReadiness: "/portal/admin/payment-readiness",
  adminStorageReadiness: "/portal/admin/storage-readiness",
  accountsInvoices: "/portal/accounts/invoices",
  accountsPayments: "/portal/accounts/payments",
  accountsBalances: "/portal/accounts/balances",
  accountsFeeding: "/portal/accounts/feeding",
  accountsTransportFees: "/portal/accounts/transport-fees",
  accountsReports: "/portal/accounts/reports",
  accountsPaymentReadiness: "/portal/accounts/payment-readiness",
} as const;

export function portalLoginForRole(role: PortalRole) {
  return `${portalRoutes.login}?role=${role}`;
}
