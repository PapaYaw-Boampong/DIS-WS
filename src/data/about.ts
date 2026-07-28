import { routes } from "@/lib/routes";
import { createPageMetadata } from "@/lib/metadata";
import { imageById, siteImages } from "@/lib/images";
import type {
  AboutValue,
  CoreValue,
  HistoryMilestone,
  LeaderProfile,
  LinkAction,
  MessageSection,
} from "@/types/content";

export const aboutMetadata = {
  overview: createPageMetadata({
    title: "About Divine",
    description:
      "Learn about Divine International School, our purpose, values, leadership and commitment to every learner.",
    path: routes.about,
  }),
  history: createPageMetadata({
    title: "Our History",
    description:
      "Explore the story, growth and continuing vision of Divine International School.",
    path: routes.history,
  }),
  principalMessage: createPageMetadata({
    title: "Principal's Message",
    description:
      "A welcome message from the leadership of Divine International School.",
    path: routes.principalMessage,
  }),
  leadership: createPageMetadata({
    title: "Leadership & Management",
    description:
      "Meet the leadership roles guiding learning, care and school operations at Divine International School.",
    path: routes.leadership,
  }),
};

export const aboutHero = {
  eyebrow: "About Divine",
  title: "Welcome to the DIS Family",
  description:
    "We are a caring school community where pupils are guided academically, socially, morally and spiritually.",
  image: siteImages.aboutHero,
  images: [
    imageById["events-graduation-adults-leadership"],
    imageById["history-students-year-group-2024"],
    imageById["events-graduation-group-c1"],
  ],
} as const;

export const historyHero = {
  eyebrow: "About Divine",
  title: "Our History",
  description:
    "The continuing story of a school community created to help children learn securely, grow confidently and live responsibly.",
  image: siteImages.historyHero,
} as const;

export const aboutOverview = {
  eyebrow: "Who We Are",
  title: "A nurturing community for confident learners",
  paragraphs: [
    "Divine International School is a caring, disciplined and future-focused school in Accra. We exist to provide a safe and inspiring environment where every child is known, supported and encouraged to grow.",
    "From Early Years through Basic and Junior High, we combine the Ghana Education Service curriculum — with a Montessori-informed approach in the early stages — to build strong academic foundations alongside character, creativity, responsibility and confidence.",
    "We work in close partnership with families, guided by our motto, GOD's Security Builds Confidence, so that together we can help each learner thrive in school, in life and in service to others.",
  ],
  imageLabel: "Divine school community",
  imageDescription:
    "Placeholder for an approved photograph showing pupils and staff in the Divine International School community.",
  image: siteImages.aboutCommunity,
  highlights: [
    { label: "GES + Montessori-informed learning", icon: "book-open" },
    { label: "A caring, disciplined community", icon: "heart" },
    { label: "Purpose-built, well-equipped campus", icon: "school" },
  ],
} as const;

export const aboutValues = [
  {
    title: "Our Mission",
    description:
      "To nurture capable, disciplined and compassionate learners through excellent teaching, purposeful guidance and strong family partnership — helping every child reach their God-given potential.",
    icon: "target",
    image: siteImages.studentConfidence,
  },
  {
    title: "Our Vision",
    description:
      "To be a trusted school community where every learner develops the knowledge, confidence and character to thrive in school, in life and in service to others.",
    icon: "eye",
    image: siteImages.graduation,
  },
] satisfies readonly AboutValue[];

export const coreValues = [
  { label: "Faith", icon: "heart" },
  { label: "Integrity", icon: "shield-check" },
  { label: "Respect", icon: "handshake" },
  { label: "Excellence", icon: "trophy" },
  { label: "Responsibility", icon: "clipboard-check" },
  { label: "Service", icon: "users" },
] satisfies readonly CoreValue[];

export const principalProfile = {
  title: "Principal / Headmaster",
  role: "Basic & Junior High leadership",
  name: "Kwasi Ohene",
  description:
    "Our principal leads a caring, accountable school culture focused on strong teaching, pupil wellbeing and meaningful partnership with families.",
  imageDescription:
    "The principal of Divine International School during a school celebration.",
  image: siteImages.principalPortrait,
  icon: "user-round",
  quote:
    "Every learner deserves to feel secure, capable and inspired to become their best.",
  action: {
    label: "Read Principal's Message",
    href: routes.principalMessage,
  },
} satisfies LeaderProfile & {
  readonly quote: string;
  readonly action: LinkAction;
};

export const historyMilestones = [
  {
    period: "Our Foundation",
    title: "A school created to serve families",
    description:
      "Divine International School began with a commitment to provide children with a secure environment, strong teaching and values-led guidance.",
  },
  {
    period: "Growing Community",
    title: "Building trusted family partnerships",
    description:
      "The school community expanded through close collaboration among pupils, parents, teachers and school leaders.",
  },
  {
    period: "Strengthening Programmes",
    title: "Developing the whole learner",
    description:
      "Academic programmes and co-curricular opportunities continued to grow around confidence, creativity, discipline and character.",
  },
  {
    period: "Looking Ahead",
    title: "Preparing learners for a changing world",
    description:
      "Divine continues to strengthen learning, digital readiness and community connection while preserving its caring identity.",
  },
] satisfies readonly HistoryMilestone[];

export const historyPhotos = [
  {
    id: "early-classroom",
    label: "Early classroom life at Divine International School",
    image: siteImages.historyOrigin,
  },
  {
    id: "year-group-2022",
    label: "Divine International School year group, 2022",
    image: siteImages.historyHero,
  },
  {
    id: "year-group-2024",
    label: "Divine International School year group, 2024",
    image: siteImages.aboutCommunity,
  },
  {
    id: "year-group-2024-two",
    label: "Divine International School students gathered in 2024",
    image: siteImages.historyYearGroup2024,
  },
  {
    id: "year-group-3",
    label: "A Divine International School year group",
    image: siteImages.historyYearGroup3,
  },
  {
    id: "year-group-4",
    label: "A Divine International School year group",
    image: siteImages.historyYearGroup4,
  },
  {
    id: "year-group-6",
    label: "A Divine International School year group",
    image: siteImages.historyYearGroup6,
  },
  {
    id: "year-group-7",
    label: "A Divine International School year group",
    image: siteImages.historyYearGroup7,
  },
  {
    id: "year-group-8",
    label: "A Divine International School year group",
    image: siteImages.historyYearGroup8,
  },
] as const;

export const historyOrigin = {
  eyebrow: "Our Story",
  title: "A continuing commitment to children and families",
  paragraphs: [
    "Divine International School was founded with a clear purpose: to give children a secure place to learn, grow and discover their God-given potential.",
    "What began as a small, close-knit school community has grown steadily — adding classrooms, laboratories and programmes — while holding firmly to the values that shaped it.",
    "As the community has developed, that purpose has remained constant. Academic progress, personal responsibility, moral guidance and supportive relationships continue to shape the Divine experience today.",
  ],
  imageLabel: "Our school story",
  imageDescription:
    "Placeholder for an approved historical or campus photograph from Divine International School.",
  image: siteImages.historyOrigin,
} as const;

export const historyLegacy = {
  eyebrow: "Our Legacy",
  title: "Growing without losing what matters",
  description:
    "Our future is built on the same principles that shaped our foundation: security, strong relationships, purposeful learning and confidence in every child.",
} as const;

export const principalMessageSections = [
  {
    paragraphs: [
      "Welcome to Divine International School. We are pleased to share a community where children are encouraged to learn with confidence, act with integrity and care for the people around them.",
      "Our responsibility extends beyond academic results. We want every learner to develop sound judgment, curiosity, resilience and the courage to contribute positively wherever life takes them.",
    ],
  },
  {
    heading: "Learning in partnership",
    paragraphs: [
      "The strongest school experience is built through partnership. Teachers, families and pupils each have an important role in creating consistent expectations and meaningful support.",
      "We value open communication with parents and remain committed to a learning environment where every child feels secure, respected and ready to participate.",
    ],
  },
  {
    heading: "Looking forward",
    paragraphs: [
      "As Divine continues to grow, we will keep strengthening teaching, leadership, wellbeing and opportunities beyond the classroom while remaining true to our values.",
      "Thank you for taking the time to learn about our school. We look forward to welcoming your family into the Divine community.",
    ],
  },
] satisfies readonly MessageSection[];

export const leadershipProfiles = [
  {
    title: "Co-Director",
    role: "School direction & governance",
    name: "Kwame Wireko Boampong",
    description:
      "Provides overall direction, governance and stewardship of the school's vision and growth.",
    icon: "user-round",
    imageDescription:
      "Placeholder portrait for a Co-Director of Divine International School.",
  },
  {
    title: "Co-Director",
    role: "School direction & governance",
    name: "Vivian Agbeme Boampong",
    description:
      "Provides overall direction, governance and stewardship of the school's vision and growth.",
    icon: "user-round",
    imageDescription:
      "Placeholder portrait for a Co-Director of Divine International School.",
  },
  {
    title: "Principal / Headmaster",
    role: "Basic & Junior High",
    name: "Kwasi Ohene",
    description:
      "Leads teaching standards, staff culture, pupil wellbeing and family partnership across Basic and JHS.",
    icon: "graduation-cap",
    imageDescription:
      "The principal of Divine International School during a school celebration.",
    image: siteImages.principalCloseUp,
  },
  {
    title: "Assistant Headmaster",
    role: "Basic & Junior High",
    name: "Bismark",
    description:
      "Supports academic leadership, daily coordination and pupil progress across Basic and JHS.",
    icon: "book-open",
    imageDescription:
      "Placeholder portrait for the Assistant Headmaster at Divine International School.",
  },
  {
    title: "Head Manager, Early Years",
    role: "Early Years leadership",
    name: "Deede Ayetee",
    description:
      "Leads the Early Years team, nurturing routines, care and foundation learning for the youngest pupils.",
    icon: "baby",
    imageDescription:
      "Placeholder portrait for the Early Years Head Manager at Divine International School.",
  },
  {
    title: "Assistant Manager, Early Years",
    role: "Early Years support",
    name: "Nancy Abatifie",
    description:
      "Supports Early Years planning, classroom care and responsive support for young learners.",
    icon: "heart",
    imageDescription:
      "Placeholder portrait for the Early Years Assistant Manager at Divine International School.",
  },
] satisfies readonly LeaderProfile[];

export const leadershipPhilosophy = [
  {
    title: "Clear Direction",
    description:
      "Leadership communicates priorities clearly and aligns people, programmes and resources around learner success.",
    icon: "compass",
  },
  {
    title: "Shared Responsibility",
    description:
      "Strong outcomes come from accountable collaboration among leaders, teachers, families and pupils.",
    icon: "handshake",
  },
  {
    title: "Safe, Ethical Practice",
    description:
      "Decisions are guided by pupil wellbeing, integrity, fairness and responsible stewardship.",
    icon: "shield-check",
  },
] satisfies readonly AboutValue[];

export const schoolCulturePoints = [
  {
    title: "Children are known",
    description:
      "Strong relationships help teachers understand each learner's needs, strengths and potential.",
    icon: "users",
  },
  {
    title: "Character matters",
    description:
      "Respect, integrity, responsibility and service are reinforced through everyday school life.",
    icon: "shield-check",
  },
  {
    title: "Learning has purpose",
    description:
      "Pupils are encouraged to ask questions, solve problems and apply their learning with confidence.",
    icon: "sparkles",
  },
  {
    title: "Safe and disciplined",
    description:
      "Clear, consistent routines create a secure setting where children feel free to participate and try.",
    icon: "shield-check",
  },
  {
    title: "Faith and values",
    description:
      "Our Christian ethos nurtures gratitude, kindness and a strong moral compass in every learner.",
    icon: "heart",
  },
  {
    title: "Families in partnership",
    description:
      "Open communication keeps parents close to their child's progress and school life.",
    icon: "handshake",
  },
] satisfies readonly AboutValue[];

export const relatedAboutPages = [
  {
    title: "Our History",
    description: "Follow the continuing story and growth of Divine.",
    href: routes.history,
    icon: "landmark",
  },
  {
    title: "Principal's Message",
    description: "Read a welcome from the school's leadership.",
    href: routes.principalMessage,
    icon: "quote",
  },
  {
    title: "Leadership & Management",
    description: "Learn about the roles guiding our school community.",
    href: routes.leadership,
    icon: "users",
  },
] as const;
