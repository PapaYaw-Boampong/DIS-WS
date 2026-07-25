import { createPageMetadata } from "@/lib/metadata";
import { siteImages } from "@/lib/images";
import { routes } from "@/lib/routes";
import type { AcademicCardItem, FacilityItem } from "@/types/content";

export const facilitiesMetadata = createPageMetadata({
  title: "Campus & Facilities",
  description:
    "Explore the learning spaces, laboratories, library, canteen, transport and feeding provision at Divine International School.",
  path: routes.facilities,
});

export const facilitiesHero = {
  eyebrow: "Campus & Facilities",
  title: "Spaces designed for safe, active learning",
  description:
    "A purpose-built campus with well-equipped classrooms, specialist laboratories and caring everyday provision for every learner.",
} as const;

export const campusOverview = {
  eyebrow: "Our Campus",
  title: "A secure, well-organised learning environment",
  paragraphs: [
    "Our campus is a purpose-built, two-storey compound arranged around bright, well-ventilated classrooms and dedicated offices for staff and support services.",
    "Learning spaces are equipped for modern, illustrative teaching, while shared facilities support science, reading, technology, healthy meals and reliable transport.",
  ],
} as const;

export const facilities = [
  {
    title: "Edu Lab",
    description:
      "A fully equipped computer laboratory with educational software across subjects and a digital board for interactive, illustrative instruction.",
    icon: "monitor",
    detail:
      "Pupils build digital confidence through guided lessons, subject software and a large digital board for whole-class demonstrations.",
    gallery: [siteImages.academicsOverview, siteImages.juniorHighHero],
  },
  {
    title: "Library",
    description:
      "A quiet, resourced reading space that encourages independent study, research and a lasting love of books.",
    icon: "library",
    detail:
      "A calm space for reading, research and quiet study, with age-appropriate books that grow a lifelong love of learning.",
  },
  {
    title: "Science Lab",
    description:
      "Fitted with apparatus for integrated science experiments across biology, chemistry and physics.",
    icon: "flask",
    detail:
      "Hands-on experiments bring biology, chemistry and physics to life in a safe, well-equipped setting.",
    gallery: [
      siteImages.scienceGallery,
      siteImages.juniorHigh,
      siteImages.academicsHero,
    ],
  },
  {
    title: "Well-equipped Classrooms",
    description:
      "Spacious, well-ventilated classrooms fitted with instructional monitors and projectors for clear, engaging lessons.",
    icon: "presentation",
    detail:
      "Bright, airy rooms with instructional monitors and projectors keep lessons clear, visual and engaging.",
    gallery: [siteImages.academicsOverview, siteImages.earlyYears],
  },
  {
    title: "Canteen",
    description:
      "Vendors for snacks and freshly prepared hot meals, with a dedicated, supervised eating area for pupils.",
    icon: "utensils",
    detail:
      "Freshly prepared meals and snacks are served in a supervised eating area that keeps pupils fuelled through the day.",
  },
  {
    title: "School Bus",
    description:
      "A school bus service with wide pick-up coverage, helping families reach and return from school safely.",
    icon: "bus",
    detail:
      "Reliable pick-up and drop-off across a wide catchment helps families get to and from school with ease.",
  },
] satisfies readonly FacilityItem[];

export const plannedFacilities = [
  {
    title: "Football Pitch",
    description:
      "A dedicated pitch to expand sports, physical education and team activities.",
    icon: "goal",
    status: "planned",
  },
  {
    title: "Playground",
    description:
      "A safe, purpose-built play area to support active, social outdoor learning.",
    icon: "trees",
    status: "planned",
  },
  {
    title: "Basketball Court",
    description:
      "A court to broaden co-curricular sport and healthy competition on campus.",
    icon: "dumbbell",
    status: "planned",
  },
] satisfies readonly FacilityItem[];

export const feedingIntro = {
  eyebrow: "Feeding",
  title: "Nutritious meals through the school day",
  description:
    "Breakfast and lunch are provided on campus so learners stay nourished, focused and ready to participate. Families can choose the billing cadence that suits them.",
} as const;

export const feedingDetails: readonly AcademicCardItem[] = [
  {
    eyebrow: "Daily",
    title: "Breakfast",
    description:
      "A nourishing breakfast helps learners start the school day focused and ready to participate.",
    icon: "utensils",
  },
  {
    eyebrow: "Daily",
    title: "Hot Lunch",
    description:
      "Freshly prepared hot meals are served at lunch every school day.",
    icon: "utensils",
  },
  {
    eyebrow: "On Campus",
    title: "Supervised Canteen",
    description:
      "A dedicated, supervised eating area with vendors for snacks and hot meals.",
    icon: "school",
  },
  {
    eyebrow: "Billing",
    title: "Termly Plan",
    description:
      "Pay once per term at a discounted rate — the most convenient feeding option for families.",
    icon: "calendar",
  },
  {
    eyebrow: "Billing",
    title: "Flexible Cycles",
    description:
      "Prefer shorter cycles? Pay monthly or weekly at the standard rate when it suits you.",
    icon: "clipboard-check",
  },
];
