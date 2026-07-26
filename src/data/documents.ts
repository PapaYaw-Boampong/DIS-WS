import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import type {
  DocumentCategory,
  SchoolDocument,
} from "@/types/content";

export const documentsMetadata = createPageMetadata({
  title: "Documents",
  description:
    "Read the school calendar, feeding menu, admissions information and other Divine International School documents online.",
  path: routes.documents,
});

export const documentsHero = {
  eyebrow: "Documents",
  title: "School documents, ready to read online",
  description:
    "Browse key school documents directly on this page — no downloads required. New documents are added as they are released.",
} as const;

// A4-ish preview page dimensions (used as intrinsic size metadata; the viewer
// renders pages with object-contain inside a fixed page frame).
const PAGE_W = 1240;
const PAGE_H = 1754;

export const documentCategories: readonly {
  readonly id: DocumentCategory;
  readonly title: string;
}[] = [
  { id: "calendar", title: "Calendar" },
  { id: "menu", title: "Feeding Menu" },
  { id: "admissions", title: "Admissions" },
  { id: "newsletter", title: "Newsletter" },
  { id: "policy", title: "Policies" },
];

export const schoolDocuments = [
  {
    slug: "school-calendar",
    title: "School Calendar",
    description:
      "Term structure, key dates and school community events for the academic year.",
    category: "calendar",
    icon: "calendar",
    updatedAt: "Preview — official dates to be confirmed",
    pages: [
      {
        src: "/documents/school-calendar/page-1.webp",
        alt: "School Calendar preview, page 1",
        width: PAGE_W,
        height: PAGE_H,
      },
      {
        src: "/documents/school-calendar/page-2.webp",
        alt: "School Calendar preview, page 2",
        width: PAGE_W,
        height: PAGE_H,
      },
      {
        src: "/documents/school-calendar/page-3.webp",
        alt: "School Calendar preview, page 3",
        width: PAGE_W,
        height: PAGE_H,
      },
    ],
  },
  {
    slug: "feeding-menu",
    title: "Feeding Menu",
    description:
      "The weekly breakfast and lunch menu served in the school canteen.",
    category: "menu",
    icon: "utensils",
    updatedAt: "Preview — sample layout",
    pages: [
      {
        src: "/documents/feeding-menu/page-1.webp",
        alt: "Feeding Menu preview, page 1",
        width: PAGE_W,
        height: PAGE_H,
      },
      {
        src: "/documents/feeding-menu/page-2.webp",
        alt: "Feeding Menu preview, page 2",
        width: PAGE_W,
        height: PAGE_H,
      },
    ],
  },
  {
    slug: "admissions-information",
    title: "Admissions Information",
    description:
      "How to apply, required documents and enrollment steps for prospective families.",
    category: "admissions",
    icon: "file-text",
    pages: [],
    pickupNote:
      "Request a copy through the admissions enquiry form or collect it from the school office.",
  },
  {
    slug: "term-newsletter",
    title: "Term Newsletter",
    description:
      "Reminders, announcements and highlights shared with the school community each term.",
    category: "newsletter",
    icon: "newspaper",
    pages: [],
    pickupNote: "The next term newsletter will be published here when released.",
  },
] satisfies readonly SchoolDocument[];
