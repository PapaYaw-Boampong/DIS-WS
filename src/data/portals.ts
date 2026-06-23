import type {
  PortalAccessStep,
  PortalItem,
  PortalNotice,
} from "@/types/content";
import { createPageMetadata } from "@/lib/metadata";
import { portalLoginForRole } from "@/lib/portal/routes";
import { routes } from "@/lib/routes";

export const portalMetadata = createPageMetadata({
  title: "Portals",
  description:
    "Access information for Divine International School student, parent, staff and admin portals.",
  path: routes.portal,
});

export const portalHero = {
  title: "Student and Staff Management",
  description:
    "Clear access pathways for students, families and staff will support school communication, learning information and administration.",
} as const;

export const portalOverview = {
  eyebrow: "Digital Access",
  title: "Divine International School Portals",
  description:
    "The portal foundation now provides mock role access for development and review. Live school accounts and operational data will only be activated after the backend and security controls are approved.",
  imageLabel: "School portal access",
  imageDescription:
    "Placeholder visual representing secure school portal access for Divine International School.",
} as const;

export const portalItems = [
  {
    title: "Student Portal",
    audience: "Students",
    description:
      "Preview the protected student shell prepared for courses, To Do items, school updates and academic information.",
    icon: "graduation-cap",
    status: "Mock Preview",
    actionLabel: "Student Login",
    href: portalLoginForRole("student"),
    features: [
      "Course pages",
      "To Do list",
      "School notices",
    ],
  },
  {
    title: "Parent Portal",
    audience: "Families",
    description:
      "Preview the protected parent shell prepared for family communication, payments, transport and learner information.",
    icon: "users",
    status: "Mock Preview",
    actionLabel: "Parent Login",
    href: portalLoginForRole("parent"),
    features: [
      "Family updates",
      "Learner communication",
      "School notices",
    ],
  },
  {
    title: "Staff Portal",
    audience: "Staff",
    description:
      "Preview the protected staff shell prepared for courses, classes, attendance and administrative workflows.",
    icon: "briefcase",
    status: "Mock Preview",
    actionLabel: "Staff Login",
    href: portalLoginForRole("staff"),
    features: [
      "Course workspaces",
      "Internal notices",
      "Administration tools",
    ],
  },
  // {
  //   title: "Admin Portal",
  //   audience: "Administration",
  //   description:
  //     "A future management area for approved administrative users and school operations.",
  //   icon: "lock-keyhole",
  //   status: "Coming Soon",
  //   actionLabel: "Admin Login",
  //   features: [
  //     "Secure administration",
  //     "School operations",
  //     "Approved user access",
  //   ],
  // },
] satisfies readonly PortalItem[];

export const portalAccessSteps = [
  {
    title: "Choose your pathway",
    description:
      "Students, parents, staff and administrators will use the pathway assigned to their role.",
    icon: "target",
  },
  {
    title: "Use official credentials",
    description:
      "Portal access will require credentials issued by Divine International School. Families, students and staff cannot self-register.",
    icon: "shield-check",
  },
  {
    title: "Contact support when needed",
    description:
      "Families and staff can contact the school if they need help with access once portals are active.",
    icon: "handshake",
  },
] satisfies readonly PortalAccessStep[];

export const portalNotice = {
  title: "Portal access is in mock preview",
  description:
    "The current portal uses fictional accounts and data for development. It is not connected to live school systems.",
} satisfies PortalNotice;

export const portalPrivacyNotes = [
  "The current portal preview uses mock role accounts and fictional school records only.",
  "Production access will not allow public self sign-up. Administrators will create or approve accounts before credentials are issued.",
  "No payment provider, database, live transport feed or production authentication service is connected.",
  "Families and staff should continue using official school communication channels until production portal credentials are issued.",
] as const;
