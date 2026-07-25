import { routes } from "@/lib/routes";
import { siteImages } from "@/lib/images";
import type {
  HeroSlide,
  HomePathway,
  HomeStat,
  LinkAction,
  SiteImage,
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
    image: siteImages.homeHero,
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
    "A safe, supportive and future-focused school where children grow in confidence, character and academic ability.",
  paragraphs: [
    "At Divine International School, every child is known, valued and supported. Guided by our motto — GOD's Security Builds Confidence — we blend a caring, disciplined environment with strong teaching so pupils grow academically, socially, morally and creatively.",
    "Our Early Years follow the Ghana Education Service curriculum with a Montessori-informed approach, while Basic and Junior High build firm foundations in literacy, numeracy, science and character. Learning continues beyond the classroom through sport, the arts, clubs and service.",
    "We work in close partnership with families — keeping communication open and expectations clear — so that together we help each learner become confident, capable and ready for what comes next.",
  ],
  action: {
    label: "Read More",
    href: routes.about,
  },
  image: siteImages.homeWelcome,
} satisfies {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly paragraphs: readonly string[];
  readonly action: LinkAction;
  readonly image: SiteImage;
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
    eyebrow: "Join us",
    description:
      "Discover a clear path into a supportive school community built for learning and growth.",
    href: routes.admissions,
    icon: "graduation-cap",
    image: siteImages.graduation,
  },
  {
    title: "A Parent",
    eyebrow: "Partner with us",
    description:
      "Find school information, family resources and access to the parent portal.",
    href: routes.portal,
    icon: "users",
    image: siteImages.aboutCommunity,
  },
  {
    title: "A Staff Member",
    eyebrow: "Work with us",
    description:
      "Access staff resources and the tools that support teaching and school operations.",
    href: routes.portal,
    icon: "briefcase",
    image: siteImages.leadershipGroup,
  },
] satisfies readonly HomePathway[];
