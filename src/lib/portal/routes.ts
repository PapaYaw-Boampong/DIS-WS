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
  // School announcements: the tab formerly called "Notifications".
  announcements: (role: PortalRole) => `/portal/${role}/announcements`,
  messages: (role: PortalRole) => `/portal/${role}/messages`,
  messageThread: (role: PortalRole, conversationId: string) =>
    `/portal/${role}/messages/${conversationId}`,
  studentCourses: "/portal/student/courses",
  studentTodo: "/portal/student/todo",
  studentAttendance: "/portal/student/attendance",
  studentTimetable: "/portal/student/timetable",
  studentProfile: "/portal/student/profile",
  studentResults: "/portal/student/results",
  staffReportCards: "/portal/staff/results",
  adminReportCards: "/portal/admin/results",
  parentEvents: "/portal/parent/events",
  parentResults: "/portal/parent/results",
  parentChildren: "/portal/parent/children",
  parentFees: "/portal/parent/fees",
  parentFeesPay: "/portal/parent/fees/pay",
  parentPayments: "/portal/parent/payments",
  parentFeeding: "/portal/parent/feeding",
  parentTransportWallet: "/portal/parent/transport-wallet",
  parentTransport: "/portal/parent/transport",
  parentTransportGeneral: "/portal/parent/transport/general",
  parentTransportPickups: "/portal/parent/transport/pickups",
  parentDocuments: "/portal/parent/documents",
  staffDocuments: "/portal/staff/documents",
  adminDocuments: "/portal/admin/documents",
  adminTransport: "/portal/admin/transport",
  // Transport operations pages, shared by the transport office and school admin.
  transportRoutes: (role: PortalRole) => `/portal/${role}/routes`,
  transportTrips: (role: PortalRole) => `/portal/${role}/trips`,
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
  // Second step of a two-factor sign-in.
  verifyCode: "/portal/verify",
  security: (role: string) => `/portal/${role}/security`,
  drive: (role: string) => `/portal/${role}/drive`,
  calendarFor: (role: string) => `/portal/${role}/calendar`,
  staffTimetable: "/portal/staff/timetable",
  transportStudents: (role: string) => `/portal/${role}/route-students`,
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
  adminWebsiteAlbums: "/portal/admin/website/albums",
  adminWebsiteLeadership: "/portal/admin/website/leadership",
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
  // People management, reachable by any role holding the capability.
  studentsRegister: (role: PortalRole) => `/portal/${role}/students`,
  studentNew: (role: PortalRole) => `/portal/${role}/students/new`,
  studentImport: (role: PortalRole) => `/portal/${role}/students/import`,
  studentPromotions: (role: PortalRole) => `/portal/${role}/promotions`,
  parentsRegister: (role: PortalRole) => `/portal/${role}/parents`,
  parentNew: (role: PortalRole) => `/portal/${role}/parents/new`,
  staffRegister: (role: PortalRole) => `/portal/${role}/staff`,
  staffNew: (role: PortalRole) => `/portal/${role}/staff/new`,
  classesRegister: (role: PortalRole) => `/portal/${role}/classes`,
  reportCards: (role: PortalRole) => `/portal/${role}/results`,
  documentsManager: (role: PortalRole) => `/portal/${role}/documents`,
  developerRoles: "/portal/developer/roles",
  // Registry administration: people records, admissions and enquiries.
  registryStudents: "/portal/registry/students",
  registryParents: "/portal/registry/parents",
  registryStaff: "/portal/registry/staff",
  registryClasses: "/portal/registry/classes",
  registryDocuments: "/portal/registry/documents",
  registryInquiries: "/portal/registry/inquiries",
  registryMailingList: "/portal/registry/mailing-list",
  // Developer administration: accounts and platform readiness.
  developerAccounts: "/portal/developer/accounts",
  developerBackendReadiness: "/portal/developer/backend-readiness",
  developerDatabaseReadiness: "/portal/developer/database-readiness",
  developerAuthReadiness: "/portal/developer/auth-readiness",
  developerPaymentReadiness: "/portal/developer/payment-readiness",
  developerStorageReadiness: "/portal/developer/storage-readiness",
} as const;

export function portalLoginForRole(role: PortalRole) {
  return `${portalRoutes.login}?role=${role}`;
}
