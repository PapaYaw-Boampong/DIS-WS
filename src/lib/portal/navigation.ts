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
    { label: "Profile", icon: "user", phase: 2 },
    { label: "Timetable", icon: "calendar", phase: 2 },
    { label: "Assignments", icon: "clipboard", phase: 2 },
    { label: "Results", icon: "chart", phase: 2 },
    { label: "Attendance", icon: "calendar", phase: 2 },
    { label: "Resources", icon: "book", phase: 2 },
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
    {
      label: "Resources",
      icon: "book",
      href: portalRoutes.staffResources,
      phase: 5,
    },
    { label: "Messages", icon: "message", phase: 5 },
  ],
  admin: [
    dashboardItem("admin"),
    { label: "Students", icon: "users", phase: 6 },
    { label: "Parents", icon: "users", phase: 6 },
    { label: "Staff", icon: "users", phase: 6 },
    { label: "Classes", icon: "school", phase: 6 },
    { label: "Fees", icon: "wallet", phase: 6 },
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
    { label: "Invoices", icon: "file", phase: 6 },
    { label: "Payments", icon: "wallet", phase: 6 },
    { label: "Balances", icon: "chart", phase: 6 },
    { label: "Feeding", icon: "wallet", phase: 6 },
    { label: "Transport Fees", icon: "bus", phase: 6 },
    { label: "Reports", icon: "file", phase: 6 },
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
