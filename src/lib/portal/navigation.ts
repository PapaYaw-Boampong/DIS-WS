import { portalRoutes } from "@/lib/portal/routes";
import type {
  PortalNavigationItem,
  PortalRole,
} from "@/types/portal";

const dashboardItem = (role: PortalRole): PortalNavigationItem => ({
  label: "Dashboard",
  icon: "dashboard",
  href: portalRoutes.dashboard(role),
  phase: 1,
});

export const portalNavigation: Record<
  PortalRole,
  readonly PortalNavigationItem[]
> = {
  student: [
    dashboardItem("student"),
    {
      label: "Courses",
      icon: "book",
      href: portalRoutes.studentCourses,
      phase: 7,
    },
    {
      label: "To Do",
      icon: "clipboard",
      href: portalRoutes.studentTodo,
      phase: 7,
    },
    { label: "Profile", icon: "user", phase: 2 },
    { label: "Timetable", icon: "calendar", phase: 2 },
    { label: "Results", icon: "chart", phase: 2 },
    { label: "Attendance", icon: "calendar", phase: 2 },
  ],
  parent: [
    dashboardItem("parent"),
    { label: "My Children", icon: "users", phase: 2 },
    {
      label: "Fees",
      icon: "wallet",
      href: portalRoutes.parentFees,
      phase: 3,
    },
    {
      label: "Payment History",
      icon: "file",
      href: portalRoutes.parentPayments,
      phase: 3,
    },
    {
      label: "Feeding",
      icon: "wallet",
      href: portalRoutes.parentFeeding,
      phase: 3,
    },
    {
      label: "Transport",
      icon: "bus",
      href: portalRoutes.parentTransport,
      phase: 4,
    },
    { label: "Results", icon: "chart", phase: 2 },
    { label: "Messages", icon: "message", phase: 2 },
  ],
  staff: [
    dashboardItem("staff"),
    {
      label: "My Classes",
      icon: "school",
      href: portalRoutes.staffClasses,
      phase: 5,
    },
    {
      label: "Courses",
      icon: "book",
      href: portalRoutes.staffCourses,
      phase: 7,
    },
    {
      label: "Attendance",
      icon: "clipboard",
      href: portalRoutes.staffAttendance,
      phase: 5,
    },
    {
      label: "Assignments",
      icon: "file",
      href: portalRoutes.staffAssignments,
      phase: 5,
    },
    {
      label: "Gradebook",
      icon: "chart",
      href: portalRoutes.staffGradebook,
      phase: 5,
    },
    { label: "Messages", icon: "message", phase: 5 },
  ],
  admin: [
    dashboardItem("admin"),
    { label: "Students", icon: "users", href: portalRoutes.adminStudents, phase: 6 },
    { label: "Parents", icon: "users", href: portalRoutes.adminParents, phase: 6 },
    { label: "Staff", icon: "users", href: portalRoutes.adminStaff, phase: 6 },
    { label: "Classes", icon: "school", href: portalRoutes.adminClasses, phase: 6 },
    { label: "Fees", icon: "wallet", href: portalRoutes.adminFees, phase: 6 },
    {
      label: "Backend Readiness",
      icon: "settings",
      href: portalRoutes.adminBackendReadiness,
      phase: 8,
    },
    {
      label: "Database Readiness",
      icon: "file",
      href: portalRoutes.adminDatabaseReadiness,
      phase: 9,
    },
    {
      label: "Auth Readiness",
      icon: "settings",
      href: portalRoutes.adminAuthReadiness,
      phase: 10,
    },
    {
      label: "Payment Readiness",
      icon: "wallet",
      href: portalRoutes.adminPaymentReadiness,
      phase: 11,
    },
    {
      label: "Storage Readiness",
      icon: "file",
      href: portalRoutes.adminStorageReadiness,
      phase: 12,
    },
    {
      label: "Transport",
      icon: "bus",
      href: portalRoutes.adminTransport,
      phase: 4,
    },
    { label: "Announcements", icon: "message", phase: 6 },
  ],
  accounts: [
    dashboardItem("accounts"),
    { label: "Invoices", icon: "file", href: portalRoutes.accountsInvoices, phase: 6 },
    { label: "Payments", icon: "wallet", href: portalRoutes.accountsPayments, phase: 6 },
    { label: "Balances", icon: "chart", href: portalRoutes.accountsBalances, phase: 6 },
    { label: "Feeding", icon: "wallet", href: portalRoutes.accountsFeeding, phase: 6 },
    { label: "Transport Fees", icon: "bus", href: portalRoutes.accountsTransportFees, phase: 6 },
    { label: "Reports", icon: "file", href: portalRoutes.accountsReports, phase: 6 },
    { label: "Payment Readiness", icon: "wallet", href: portalRoutes.accountsPaymentReadiness, phase: 11 },
  ],
  transport: [
    dashboardItem("transport"),
    { label: "Routes", icon: "bus", phase: 4 },
    { label: "Trips", icon: "calendar", phase: 4 },
    { label: "Students", icon: "users", phase: 4 },
    { label: "Announcements", icon: "message", phase: 4 },
    { label: "Settings", icon: "settings", phase: 4 },
  ],
};
