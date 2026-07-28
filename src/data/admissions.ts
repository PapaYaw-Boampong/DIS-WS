import type {
  AdmissionBenefit,
  AdmissionFAQ,
  AdmissionRequirementGroup,
  AdmissionStage,
} from "@/types/content";
import { createPageMetadata } from "@/lib/metadata";
import { imageById, siteImages } from "@/lib/images";
import { routes } from "@/lib/routes";

export const admissionsMetadata = createPageMetadata({
  title: "Admissions",
  description:
    "Learn about joining Divine International School, the admission process, required documents and how to contact Admissions.",
  path: routes.admissions,
});

export const admissionsHero = {
  title: "Admissions",
  description:
    "A nurturing school community committed to academic excellence, discipline and character development.",
  image: siteImages.admissionsHero,
} as const;

export const admissionsIntroduction = {
  eyebrow: "Welcome",
  title: "Welcome to the DIS Family",
  paragraphs: [
    "Choosing a school is an important family decision. Our admissions process is designed to help you understand the Divine learning community and identify the most suitable stage for your child.",
    "We encourage families to ask questions, speak with Admissions and learn about our academic approach before completing enrollment steps.",
  ],
} as const;

export const admissionBenefits = [
  {
    title: "Purposeful Learning",
    description:
      "Clear teaching, guided practice and thoughtful feedback support progress at every academic stage.",
    icon: "book-open",
    image: imageById["academics-elearners-kids-arc-learning"],
  },
  {
    title: "Nurturing Community",
    description:
      "Consistent routines and caring relationships help learners feel known, supported and ready to participate.",
    icon: "heart",
    image: siteImages.colourDay,
  },
  {
    title: "Character Development",
    description:
      "Respect, responsibility, discipline and service are reinforced throughout school life.",
    icon: "shield-check",
    image: imageById["events-career-day-soldiers"],
  },
  {
    title: "Family Partnership",
    description:
      "Clear communication helps families understand expectations, progress and the next steps for their child.",
    icon: "users",
    image: imageById["events-graduation-group-younger-student-walk-up-close-up"],
  },
] satisfies readonly AdmissionBenefit[];

export const admissionStages = [
  {
    step: 1,
    title: "Enquiry & Application",
    points: [
      "Make an enquiry by phone or email",
      "Request the official application form and complete it",
    ],
  },
  {
    step: 2,
    title: "Assessment",
    points: [
      "Sit an age-appropriate entrance examination",
      "Attend a short oral interview with the school",
    ],
  },
  {
    step: 3,
    title: "Enrollment",
    points: [
      "Provide two passport photographs and ID (Birth Certificate or Ghana Card)",
      "Receive your package documents and instructions",
      "Complete fee payment — first-time admits pay the one-time admission fee and school fees in full; payment plans are available for continuing students on enquiry",
    ],
  },
] satisfies readonly AdmissionStage[];

export const admissionRequirements = [
  {
    title: "Learner Identification",
    description:
      "Documents used to confirm the learner's identity and age.",
    icon: "user-round",
    requirement: "required",
    items: [
      "Two (2) recent passport photographs",
      "A form of ID — Birth Certificate or Ghana Card",
      "Completed application form supplied by the school",
    ],
  },
  {
    title: "Previous Learning",
    description:
      "Records that help the school understand the learner's current stage.",
    icon: "school",
    requirement: "recommended",
    items: [
      "Recent school reports, where applicable",
      "Transfer or attendance records, where applicable",
      "Relevant learning-support information",
    ],
  },
  {
    title: "Family and Wellbeing",
    description:
      "Information needed for communication, safety and learner support.",
    icon: "heart",
    requirement: "recommended",
    items: [
      "Parent or guardian contact information",
      "Emergency contact details",
      "Relevant medical or allergy information",
    ],
  },
] satisfies readonly AdmissionRequirementGroup[];

export const admissionsFees = {
  eyebrow: "Fees and Payment",
  title: "Request the current fee schedule",
  description:
    "Fee schedules and payment instructions can change between enrollment periods. Contact Admissions for the current approved information before making a payment.",
} as const;

export const admissionFAQs = [
  {
    question: "Which academic levels can families enquire about?",
    answer:
      "Families may enquire about Early Years, Primary and Junior High. Admissions will confirm current entry availability and the appropriate placement process.",
  },
  {
    question: "Is an assessment required for every applicant?",
    answer:
      "Assessment or interview requirements may vary by academic stage and application. Admissions will explain what applies before arranging a session.",
  },
  {
    question: "Can we visit the school before applying?",
    answer:
      "Families are encouraged to speak with Admissions about an appropriate time to learn more about the school and its programmes.",
  },
  {
    question: "Are fees published on this page?",
    answer:
      "No. Please request the current approved fee schedule directly from Admissions before making enrollment decisions or payments.",
  },
  {
    question: "Does this enquiry form submit an application?",
    answer:
      "No. The form currently helps families prepare an enquiry. Admissions will provide the official application process and required documents.",
  },
] satisfies readonly AdmissionFAQ[];
