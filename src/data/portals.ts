import type {
  PortalAccessStep,
  PortalItem,
  PortalNotice,
} from "@/types/content";
import { createPageMetadata } from "@/lib/metadata";
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
    "The public portal landing page introduces future access areas for the school community. Full dashboard functionality will be activated only after official portal systems are approved.",
  imageLabel: "School portal access",
  imageDescription:
    "Placeholder visual representing secure school portal access for Divine International School.",
} as const;

export const portalItems = [
  {
    title: "Student Portal",
    audience: "Students",
    description:
      "A future pathway for learner resources, school updates and academic information.",
    icon: "graduation-cap",
    status: "Coming Soon",
    actionLabel: "Student Login",
    features: [
      "Learning resources",
      "School notices",
      "Academic information",
    ],
  },
  {
    title: "Parent Portal",
    audience: "Families",
    description:
      "A future access point for family communication, notices and learner support information.",
    icon: "users",
    status: "Coming Soon",
    actionLabel: "Parent Login",
    features: [
      "Family updates",
      "Learner communication",
      "School resources",
    ],
  },
  {
    title: "Staff Portal",
    audience: "Staff",
    description:
      "A future staff access area for internal school resources and administrative workflows.",
    icon: "briefcase",
    status: "Coming Soon",
    actionLabel: "Staff Login",
    features: [
      "Staff resources",
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
      "Portal access will require credentials issued or approved by Divine International School.",
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
  title: "Portal access is coming soon",
  description:
    "The selected portal is not active yet. Please contact the school office for current support or access information.",
} satisfies PortalNotice;

export const portalPrivacyNotes = [
  "Portal access will be limited to approved users and role-specific information.",
  "Families and staff should use only official school communication channels until portal credentials are issued.",
  "No authentication system, dashboard or private student information is included in this public website phase.",
] as const;
