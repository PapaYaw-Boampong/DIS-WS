import { routes } from "@/lib/routes";
import { school } from "@/data/school";
import { createPageMetadata } from "@/lib/metadata";
import type { ContactDetail, ContactReason } from "@/types/content";

export const contactMetadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Divine International School for admissions, school information, portal support and location details.",
  path: routes.contact,
});

export const contactHero = {
  title: "Contact Divine International School",
  description:
    "Speak with the school team about admissions, academics, student life, portal support or visiting the campus.",
} as const;

export const contactDetails = [
  {
    title: "Call the School",
    value: school.phoneDisplay,
    href: school.phoneHref,
    description:
      "Use the school phone line for direct questions during office hours.",
    icon: "phone",
  },
  {
    title: "Email",
    value: school.email,
    href: `mailto:${school.email}`,
    description:
      "Send general questions, admissions enquiries or support requests by email.",
    icon: "mail",
  },
  {
    title: "Visit",
    value: school.location,
    href: routes.location,
    description:
      "Use the location page for map access and visit guidance.",
    icon: "map-pin",
  },
  {
    title: "Office Hours",
    value: school.hours,
    description:
      "Contact and visit arrangements should be confirmed during school hours.",
    icon: "calendar",
  },
] satisfies readonly ContactDetail[];

export const contactReasons = [
  {
    title: "Admissions",
    description:
      "Ask about application steps, required documents, school visits and enrollment guidance.",
    icon: "clipboard-check",
  },
  {
    title: "Academics",
    description:
      "Discuss academic stages, learning support, calendars and teacher communication.",
    icon: "book-open",
  },
  {
    title: "Portal Support",
    description:
      "Request guidance about future student, parent, staff or admin portal access.",
    icon: "lock-keyhole",
  },
  {
    title: "Location and Visits",
    description:
      "Find the campus, review visit notes and confirm the best time to come.",
    icon: "map-pin",
  },
] satisfies readonly ContactReason[];
