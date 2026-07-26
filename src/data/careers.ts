import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";
import { school } from "@/data/school";
import type { AdmissionBenefit, AdmissionStep } from "@/types/content";

export const careersMetadata = createPageMetadata({
  title: "Careers",
  description:
    "Join the teaching and support team at Divine International School. Learn how to apply and the benefits of working with us.",
  path: routes.careers,
});

export const careersHero = {
  eyebrow: "Work With Us",
  title: "Build your career at Divine",
  description:
    "We are always glad to hear from dedicated educators and support staff who share our commitment to caring, high-quality learning.",
} as const;

export const careersIntro = {
  eyebrow: "Join the Team",
  title: "Grow with a supportive school community",
  paragraphs: [
    "Our staff are central to the Divine experience. We look for committed, professional people who value strong teaching, pupil wellbeing and close partnership with families.",
    "Applications are welcome throughout the year and are kept on file for suitable openings across our Early Years, Basic and Junior High teams.",
  ],
} as const;

export const careerSteps = [
  {
    step: 1,
    title: "Send your application",
    description: `Email your application directly to our hiring address (${school.email}), including a passport photograph, your CV and any projects or additional experience.`,
  },
  {
    step: 2,
    title: "Application review",
    description:
      "Our team reviews each application against current and upcoming staffing needs across the school.",
  },
  {
    step: 3,
    title: "Interview",
    description:
      "Shortlisted candidates are contacted to arrange an interview and, where relevant, a teaching conversation.",
  },
] satisfies readonly AdmissionStep[];

export const careerBenefits = [
  {
    title: "Staff Training",
    description:
      "Ongoing professional development and training programmes help staff grow in their practice.",
    icon: "graduation-cap",
  },
  {
    title: "Staff Feeding",
    description:
      "Staff are provided with meals during the school day as part of a supportive working environment.",
    icon: "utensils",
  },
  {
    title: "Merit-based Bonuses",
    description:
      "Yearly, merit-based bonuses recognise dedication, impact and excellent contribution.",
    icon: "trophy",
  },
] satisfies readonly AdmissionBenefit[];
