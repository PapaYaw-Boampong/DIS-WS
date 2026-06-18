import { routes } from "@/lib/routes";
import type {
  HeroSlide,
  HomePathway,
  HomeStat,
  LinkAction,
} from "@/types/content";

export const homeHeroSlides: readonly HeroSlide[] = [
  {
    title: "GOD's Security Builds Confidence",
    description:
      "A nurturing school community committed to academic excellence, discipline and character development.",
    primaryAction: {
      label: "Apply Now",
      href: routes.admissions,
    },
    secondaryAction: {
      label: "Explore School",
      href: routes.about,
    },
  },
];

export const homeStats = [
  {
    value: "25+",
    label: "Years of Excellence",
  },
  {
    value: "600+",
    label: "Students Enrolled",
  },
  {
    value: "60+",
    label: "Dedicated Staff",
  },
  {
    value: "12+",
    label: "Academic Programmes",
  },
] satisfies readonly HomeStat[];

export const welcomeContent = {
  eyebrow: "Welcome",
  title: "Welcome to Divine International School",
  description:
    "A safe and supportive learning environment where children grow academically, socially, morally and creatively.",
  action: {
    label: "Read More",
    href: routes.about,
  },
} satisfies {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly action: LinkAction;
};

export const schoolMessage = {
  title: "A Message from Our School",
  description:
    "Every learner is welcomed into a caring family of teachers, parents and peers.",
  action: {
    label: "Read Principal Message",
    href: routes.principalMessage,
  },
} satisfies {
  readonly title: string;
  readonly description: string;
  readonly action: LinkAction;
};

export const homePathways = [
  {
    title: "A Student",
    description:
      "Discover a clear path into a supportive school community built for learning and growth.",
    href: routes.admissions,
    icon: "graduation-cap",
  },
  {
    title: "A Parent",
    description:
      "Find school information, family resources and access to the parent portal.",
    href: routes.portal,
    icon: "users",
  },
  {
    title: "A Staff Member",
    description:
      "Access staff resources and the tools that support teaching and school operations.",
    href: routes.portal,
    icon: "briefcase",
  },
] satisfies readonly HomePathway[];
