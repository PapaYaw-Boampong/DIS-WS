import { routes } from "@/lib/routes";
import type { FooterLinkGroup, NavItem } from "@/types/content";

export const mainNavigation = [
  {
    label: "Home",
    href: routes.home,
  },
  {
    label: "About",
    href: routes.about,
    children: [
      { label: "About Divine", href: routes.about },
      { label: "History", href: routes.history },
      { label: "Principal's Message", href: routes.principalMessage },
      { label: "Leadership & Management", href: routes.leadership },
    ],
  },
  {
    label: "Academics",
    href: routes.academics,
    children: [
      { label: "Academic Overview", href: routes.academics },
      {
        label: "Early Years",
        href: routes.academicLevel("early-years"),
      },
      {
        label: "Primary School",
        href: routes.academicLevel("primary"),
      },
      {
        label: "Junior High School",
        href: routes.academicLevel("junior-high"),
      },
      // {
      //   label: "Co-curricular",
      //   href: routes.academicLevel("co-curricular"),
      // },
      { label: "Meet Our Teachers", href: routes.teachers },
      { label: "School Calendar", href: routes.calendar },
    ],
  },
  {
    label: "Admissions",
    href: routes.admissions,
  },
  {
    label: "Student Life",
    href: routes.studentLife,
  },
  {
    label: "News",
    href: routes.news,
  },
  {
    label: "Contact",
    href: routes.contact,
  },
] satisfies readonly NavItem[];

export const portalLinks = [
  { label: "DIS Portals", href: routes.portal },
] satisfies readonly NavItem[];

export const footerLinkGroups = [
  {
    title: "Quick Links",
    links: [
      { label: "About Divine", href: routes.about },
      { label: "Admissions", href: routes.admissions },
      { label: "Academics", href: routes.academics },
      { label: "News & Events", href: routes.news },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Portals",
    links: [
      { label: "Student Portal", href: routes.portal },
      { label: "Parent Portal", href: routes.portal },
      { label: "Staff Portal", href: routes.portal },
      { label: "Admin Login", href: routes.portal },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Calendar", href: routes.calendar },
      { label: "Fees & Requirements", href: routes.admissions },
      { label: "Policies", href: routes.about },
      { label: "Gallery", href: routes.studentLife },
      { label: "Location", href: routes.location },
    ],
  },
] satisfies readonly FooterLinkGroup[];
