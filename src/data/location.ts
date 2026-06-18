import { routes } from "@/lib/routes";
import { school } from "@/data/school";
import { createPageMetadata } from "@/lib/metadata";
import type { LocationPoint, MapEmbed, VisitNote } from "@/types/content";

const encodedLocation = encodeURIComponent(
  `${school.name}, ${school.location}`,
);

export const locationMetadata = createPageMetadata({
  title: "Location",
  description:
    "Find Divine International School with map access, contact details, office hours and visit guidance.",
  path: routes.location,
});

export const locationHero = {
  title: "Find Divine International School",
  description:
    "Use the map and visit information below to locate the school and plan your visit.",
} as const;

export const mapEmbed = {
  title: "Google Maps location for Divine International School",
  src: `https://www.google.com/maps?q=${encodedLocation}&output=embed`,
  externalHref: `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
} satisfies MapEmbed;

export const locationPoints = [
  {
    title: "School",
    value: school.name,
    description: school.description,
    icon: "school",
  },
  {
    title: "Location",
    value: school.location,
    description:
      "Exact visit details should be confirmed with the school before travel.",
    icon: "map-pin",
  },
  {
    title: "Office Hours",
    value: school.hours,
    description:
      "Please contact the school before arriving outside normal office hours.",
    icon: "calendar",
  },
] satisfies readonly LocationPoint[];

export const visitNotes = [
  {
    title: "Confirm before visiting",
    description:
      "Call or email the school to confirm visit timing, admissions availability and any required documents.",
    icon: "phone",
  },
  {
    title: "Use official directions",
    description:
      "Use the map link as a guide and confirm final directions directly with the school office.",
    icon: "map-pin",
  },
  {
    title: "Admissions visits",
    description:
      "Families interested in joining Divine can combine a location visit with an admissions enquiry.",
    icon: "clipboard-check",
  },
] satisfies readonly VisitNote[];

export const locationActions = {
  contact: routes.contact,
  admissions: routes.admissions,
} as const;
