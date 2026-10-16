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

const messagesItem = (role: PortalRole): PortalNavigationItem => ({
  label: "Messages",
  icon: "message",
  href: portalRoutes.messages(role),
  phase: 16,
});

const announcementsItem = (role: PortalRole): PortalNavigationItem => ({
  label: "Announcements",
  icon: "bell",
  href: portalRoutes.announcements(role),
  phase: 16,
});

// One calendar per person. Canvas puts this front and centre for a reason:
// "what is happening and when" is the question every role opens the portal to
// answer, and it was previously split across Timetable, Events and the public
// calendar.
const calendarItem = (role: PortalRole): PortalNavigationItem => ({
  label: "Calendar",
  icon: "calendar",
  href: portalRoutes.calendarFor(role),
  phase: 24,
});

// Account security is every role's concern: a parent account holds their
// children's records and payment history, not just an administrator's.
const securityItem = (role: PortalRole): PortalNavigationItem => ({
  label: "Security",
  icon: "settings",
  href: portalRoutes.security(role),
  phase: 23,
});


// People management is shared between the registry and the school
// administrator; each entry appears only when the role holds its capability,
// which the developer portal controls.
const peopleItems = (role: PortalRole): readonly PortalNavigationItem[] => [
  {
    label: "Students",
    icon: "users",
    phase: 6,
    capability: "students.view",
    children: [
      {
        label: "Register",
        icon: "users",
        href: portalRoutes.studentsRegister(role),
        phase: 6,
        capability: "students.view",
      },
      {
        label: "Add Student",
        icon: "user",
        href: portalRoutes.studentNew(role),
        phase: 6,
        capability: "students.create",
      },
      {
        label: "Import List",
        icon: "file",
        href: portalRoutes.studentImport(role),
        phase: 6,
        capability: "students.import",
      },
      {
        label: "Promotions",
        icon: "chart",
        href: portalRoutes.studentPromotions(role),
        phase: 6,
        capability: "students.promote",
      },
    ],
  },
  {
    label: "Parents",
    icon: "users",
    phase: 6,
    capability: "parents.view",
    children: [
      {
        label: "Register",
        icon: "users",
        href: portalRoutes.parentsRegister(role),
        phase: 6,
        capability: "parents.view",
      },
      {
        label: "Add Parent",
        icon: "user",
        href: portalRoutes.parentNew(role),
        phase: 6,
        capability: "parents.create",
      },
    ],
  },
  {
    label: "Staff Records",
    icon: "users",
    phase: 6,
    capability: "staff.view",
    children: [
      {
        label: "Register",
        icon: "users",
        href: portalRoutes.staffRegister(role),
        phase: 6,
        capability: "staff.view",
      },
      {
        label: "Add Staff",
        icon: "user",
        href: portalRoutes.staffNew(role),
        phase: 6,
        capability: "staff.create",
      },
    ],
  },
  {
    label: "Classes",
    icon: "school",
    href: portalRoutes.classesRegister(role),
    phase: 6,
    capability: "classes.manage",
  },
];

export const portalNavigation: Record<
  PortalRole,
  readonly PortalNavigationItem[]
> = {
  student: [
    dashboardItem("student"),
    messagesItem("student"),
    announcementsItem("student"),
    calendarItem("student"),
    securityItem("student"),
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
    {
      label: "Timetable",
      icon: "calendar",
      href: portalRoutes.studentTimetable,
      phase: 2,
    },
    {
      label: "Results",
      icon: "chart",
      href: portalRoutes.studentResults,
      phase: 2,
    },
    {
      label: "Attendance",
      icon: "calendar",
      href: portalRoutes.studentAttendance,
      phase: 21,
    },
    {
      label: "Profile",
      icon: "user",
      href: portalRoutes.studentProfile,
      phase: 2,
    },
  ],
  parent: [
    dashboardItem("parent"),
    messagesItem("parent"),
    announcementsItem("parent"),
    calendarItem("parent"),
    securityItem("parent"),
    {
      label: "Fees",
      icon: "wallet",
      phase: 3,
      children: [
        {
          label: "Overview",
          icon: "wallet",
          href: portalRoutes.parentFees,
          phase: 13,
        },
        {
          label: "Pay Now",
          icon: "wallet",
          href: portalRoutes.parentFeesPay,
          phase: 13,
        },
        {
          label: "Payment History",
          icon: "file",
          href: portalRoutes.parentPayments,
          phase: 3,
        },
        {
          label: "Feeding Wallet",
          icon: "wallet",
          href: portalRoutes.parentFeeding,
          phase: 3,
        },
        {
          label: "Transport Wallet",
          icon: "bus",
          href: portalRoutes.parentTransportWallet,
          phase: 14,
        },
      ],
    },
    {
      label: "Transport",
      icon: "bus",
      phase: 4,
      children: [
        {
          label: "Tracking",
          icon: "bus",
          href: portalRoutes.parentTransport,
          phase: 4,
        },
        {
          label: "General",
          icon: "file",
          href: portalRoutes.parentTransportGeneral,
          phase: 4,
        },
        {
          label: "Pickups & Drops",
          icon: "calendar",
          href: portalRoutes.parentTransportPickups,
          phase: 4,
        },
      ],
    },
    {
      label: "Results",
      icon: "chart",
      href: portalRoutes.parentResults,
      phase: 2,
    },
    {
      label: "Documents",
      icon: "file",
      href: portalRoutes.parentDocuments,
      phase: 15,
    },
    {
      label: "Events",
      icon: "calendar",
      href: portalRoutes.parentEvents,
      phase: 13,
    },
    // Kept last: families open a child record from here after the day-to-day
    // fees, transport and results tabs.
    {
      label: "My Children",
      icon: "users",
      href: portalRoutes.parentChildren,
      phase: 2,
    },
  ],
  staff: [
    dashboardItem("staff"),
    messagesItem("staff"),
    announcementsItem("staff"),
    calendarItem("staff"),
    securityItem("staff"),
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
      label: "Timetable",
      icon: "calendar",
      href: portalRoutes.staffTimetable,
      phase: 24,
    },
    {
      label: "Gradebook",
      icon: "chart",
      href: portalRoutes.staffGradebook,
      phase: 5,
    },
    {
      label: "Report Cards",
      icon: "file",
      href: portalRoutes.staffReportCards,
      phase: 5,
      capability: "reportcards.publish",
    },
    {
      label: "Documents",
      icon: "file",
      href: portalRoutes.staffDocuments,
      phase: 21,
    },
  ],
  // School administration: running the school day to day.
  admin: [
    dashboardItem("admin"),
    messagesItem("admin"),
    announcementsItem("admin"),
    calendarItem("admin"),
    securityItem("admin"),
    ...peopleItems("admin"),
    {
      label: "Report Cards",
      icon: "chart",
      href: portalRoutes.adminReportCards,
      phase: 6,
      capability: "reportcards.publish",
    },
    { label: "Fees", icon: "wallet", href: portalRoutes.adminFees, phase: 6 },
    {
      label: "Payments",
      icon: "wallet",
      href: portalRoutes.adminPayments,
      phase: 17,
    },
    {
      label: "Transport",
      icon: "bus",
      phase: 4,
      children: [
        {
          label: "Overview",
          icon: "bus",
          href: portalRoutes.adminTransport,
          phase: 4,
        },
        {
          label: "Routes",
          icon: "bus",
          href: portalRoutes.transportRoutes("admin"),
          phase: 4,
        },
        {
          label: "Trips",
          icon: "calendar",
          href: portalRoutes.transportTrips("admin"),
          phase: 4,
        },
      ],
    },
    {
      label: "Documents",
      icon: "file",
      href: portalRoutes.adminDocuments,
      phase: 21,
    },
    {
      label: "Website",
      icon: "globe",
      phase: 18,
      capability: "website.manage",
      children: [
        {
          label: "Overview",
          icon: "globe",
          href: portalRoutes.adminWebsite,
          phase: 18,
        },
        {
          label: "News & Updates",
          icon: "file",
          href: portalRoutes.adminWebsiteNews,
          phase: 18,
        },
        {
          label: "Events",
          icon: "message",
          href: portalRoutes.adminWebsiteEvents,
          phase: 18,
        },
        {
          label: "Photo Albums",
          icon: "file",
          href: portalRoutes.adminWebsiteAlbums,
          phase: 24,
        },
        {
          label: "Leadership",
          icon: "users",
          href: portalRoutes.adminWebsiteLeadership,
          phase: 24,
        },
        {
          label: "Calendar",
          icon: "calendar",
          href: portalRoutes.adminWebsiteCalendar,
          phase: 18,
        },
      ],
    },
  ],
  // Registry: the people records of the school.
  registry: [
    dashboardItem("registry"),
    messagesItem("registry"),
    announcementsItem("registry"),
    calendarItem("registry"),
    securityItem("registry"),
    ...peopleItems("registry"),
    {
      label: "Admissions",
      icon: "message",
      href: portalRoutes.registryInquiries,
      phase: 21,
      capability: "admissions.manage",
    },
    {
      label: "Mailing List",
      icon: "message",
      href: portalRoutes.registryMailingList,
      phase: 21,
      capability: "admissions.manage",
    },
    {
      label: "Documents",
      icon: "file",
      href: portalRoutes.registryDocuments,
      phase: 21,
    },
  ],
  // Developer / IT administration: accounts and platform readiness.
  developer: [
    dashboardItem("developer"),
    messagesItem("developer"),
    announcementsItem("developer"),
    calendarItem("developer"),
    securityItem("developer"),
    {
      label: "Role Permissions",
      icon: "settings",
      href: portalRoutes.developerRoles,
      phase: 21,
    },
    {
      label: "User Accounts",
      icon: "settings",
      href: portalRoutes.developerAccounts,
      phase: 21,
      capability: "accounts.manage",
    },
    {
      label: "Readiness",
      icon: "settings",
      phase: 8,
      children: [
        {
          label: "Backend",
          icon: "settings",
          href: portalRoutes.developerBackendReadiness,
          phase: 8,
        },
        {
          label: "Database",
          icon: "file",
          href: portalRoutes.developerDatabaseReadiness,
          phase: 9,
        },
        {
          label: "Auth",
          icon: "settings",
          href: portalRoutes.developerAuthReadiness,
          phase: 10,
        },
        {
          label: "Payments",
          icon: "wallet",
          href: portalRoutes.developerPaymentReadiness,
          phase: 11,
        },
        {
          label: "Storage",
          icon: "file",
          href: portalRoutes.developerStorageReadiness,
          phase: 12,
        },
      ],
    },
  ],
  accounts: [
    dashboardItem("accounts"),
    messagesItem("accounts"),
    announcementsItem("accounts"),
    calendarItem("accounts"),
    securityItem("accounts"),
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
    // First in the list on purpose: this is what a driver opens on their phone
    // at the start of a run, not something to hunt for behind other pages.
    {
      label: "Share location",
      icon: "bus",
      href: portalRoutes.drive("transport"),
      phase: 24,
      capability: "transport.manage",
    },
    messagesItem("transport"),
    announcementsItem("transport"),
    calendarItem("transport"),
    securityItem("transport"),
    {
      label: "Routes",
      icon: "bus",
      href: portalRoutes.transportRoutes("transport"),
      phase: 4,
    },
    {
      label: "Trips",
      icon: "calendar",
      href: portalRoutes.transportTrips("transport"),
      phase: 4,
    },
    {
      label: "Students",
      icon: "users",
      href: portalRoutes.transportStudents("transport"),
      phase: 24,
      capability: "transport.manage",
    },
  ],
};

/**
 * Removes navigation entries whose capability the role does not hold. A group
 * disappears once every child inside it is filtered out.
 */
export function filterNavigationByCapabilities(
  items: readonly PortalNavigationItem[],
  capabilities: readonly string[],
): readonly PortalNavigationItem[] {
  return items
    .filter((item) => !item.capability || capabilities.includes(item.capability))
    .map((item) => {
      if (!item.children?.length) {
        return item;
      }

      return {
        ...item,
        children: item.children.filter(
          (child) => !child.capability || capabilities.includes(child.capability),
        ),
      };
    })
    .filter((item) => Boolean(item.href) || Boolean(item.children?.length));
}
