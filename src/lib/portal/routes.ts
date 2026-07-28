import type { PortalRole } from "@/types/portal";

export const portalRoutes = {
  landing: "/portal",
  login: "/portal/login",
  dashboard: (role: PortalRole) => `/portal/${role}/dashboard`,
  course: (role: PortalRole, courseId: string) =>
    `/portal/${role}/courses/${courseId}`,
  courseModules: (role: PortalRole, courseId: string) =>
    `/portal/${role}/courses/${courseId}/modules`,
  courseModuleItem: (
    role: PortalRole,
    courseId: string,
    moduleId: string,
    itemId: string,
  ) =>
    `/portal/${role}/courses/${courseId}/modules/${moduleId}/items/${itemId}`,
  courseAssignments: (role: PortalRole, courseId: string) =>
    `/portal/${role}/courses/${courseId}/assignments`,
  courseAssignmentDetail: (
    role: PortalRole,
    courseId: string,
    assignmentId: string,
  ) => `/portal/${role}/courses/${courseId}/assignments/${assignmentId}`,
  courseGrades: (role: PortalRole, courseId: string) =>
    `/portal/${role}/courses/${courseId}/grades`,
  coursePeople: (role: PortalRole, courseId: string) =>
    `/portal/${role}/courses/${courseId}/people`,
  notifications: (role: PortalRole) => `/portal/${role}/notifications`,
  messages: (role: PortalRole) => `/portal/${role}/messages`,
  messageThread: (role: PortalRole, conversationId: string) =>
    `/portal/${role}/messages/${conversationId}`,
  studentCourses: "/portal/student/courses",
  studentTodo: "/portal/student/todo",
  studentAttendance: "/portal/student/attendance",
  parentEvents: "/portal/parent/events",
  parentFees: "/portal/parent/fees",
  parentFeesPay: "/portal/parent/fees/pay",
  parentPayments: "/portal/parent/payments",
  parentFeeding: "/portal/parent/feeding",
  parentTransportWallet: "/portal/parent/transport-wallet",
  parentTransport: "/portal/parent/transport",
  parentDocuments: "/portal/parent/documents",
  staffDocuments: "/portal/staff/documents",
  adminDocuments: "/portal/admin/documents",
  adminTransport: "/portal/admin/transport",
  staffClasses: "/portal/staff/classes",
  staffCourses: "/portal/staff/courses",
  staffAttendance: "/portal/staff/attendance",
  staffAssignments: "/portal/staff/assignments",
  staffAssignmentNew: "/portal/staff/assignments/new",
  staffCourseMaterialNew: (courseId: string) =>
    `/portal/staff/courses/${courseId}/materials/new`,
  courseMaterialDownload: (
    role: PortalRole,
    courseId: string,
    resourceId: string,
  ) => `/portal/${role}/courses/${courseId}/materials/${resourceId}/download`,
  courseSubmissionDownload: (
    role: PortalRole,
    courseId: string,
    assignmentId: string,
    submissionId: string,
  ) =>
    `/portal/${role}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/download`,
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
  changePassword: "/portal/change-password",
  adminStorageReadiness: "/portal/admin/storage-readiness",
  adminPayments: "/portal/admin/payments",
  adminAccounts: "/portal/admin/accounts",
  adminWebsite: "/portal/admin/website",
  adminWebsiteNews: "/portal/admin/website/news",
  adminWebsiteNewsNew: "/portal/admin/website/news/new",
  adminWebsiteNewsEdit: (postId: string) =>
    `/portal/admin/website/news/${postId}`,
  adminWebsiteEvents: "/portal/admin/website/events",
  adminWebsiteCalendar: "/portal/admin/website/calendar",
  adminMailingList: "/portal/admin/mailing-list",
  adminInquiries: "/portal/admin/inquiries",
  paymentsStatements: (role: PortalRole) =>
    `/portal/${role}/payments/statements`,
  paymentStatementDetail: (role: PortalRole, importId: string) =>
    `/portal/${role}/payments/statements/${importId}`,
  paymentAttachment: (role: PortalRole, paymentId: string) =>
    `/portal/${role}/payments/${paymentId}/attachment`,
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
