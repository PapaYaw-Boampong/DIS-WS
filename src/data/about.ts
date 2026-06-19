import { routes } from "@/lib/routes";
import { createPageMetadata } from "@/lib/metadata";
import { siteImages } from "@/lib/images";
import type {
  AboutValue,
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
    "Divine International School exists to provide a safe, disciplined and inspiring environment where every child is known, supported and encouraged to grow.",
    "We work in partnership with families to build strong academic foundations while developing character, creativity, responsibility and confidence.",
  ],
  imageLabel: "Divine school community",
  imageDescription:
    "Placeholder for an approved photograph showing pupils and staff in the Divine International School community.",
  image: siteImages.aboutCommunity,
} as const;

export const aboutValues = [
  {
    title: "Our Mission",
    description:
      "To nurture capable, disciplined and compassionate learners through excellent teaching, purposeful guidance and strong family partnership.",
    icon: "target",
  },
  {
    title: "Our Vision",
    description:
      "To be a trusted school community where every learner develops the knowledge, confidence and character to thrive.",
    icon: "eye",
  },
  {
    title: "Our Values",
    description:
      "Faith, integrity, respect, excellence, responsibility and service shape how our community learns and works together.",
    icon: "heart",
  },
] satisfies readonly AboutValue[];

export const principalProfile = {
  title: "School Principal",
  role: "Principal's name to be confirmed",
  description:
    "Our principal leads a caring, accountable school culture focused on strong teaching, pupil wellbeing and meaningful partnership with families.",
  imageDescription:
    "Placeholder portrait for the principal of Divine International School.",
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
] as const;

export const historyOrigin = {
  eyebrow: "Our Story",
  title: "A continuing commitment to children and families",
  paragraphs: [
    "The Divine International School story is rooted in a clear purpose: to give children a secure place to learn, grow and discover their potential.",
    "As the community has developed, that purpose has remained constant. Academic progress, personal responsibility, moral guidance and supportive relationships continue to shape the school experience.",
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
    title: "School Principal",
    role: "Whole-school leadership",
    description:
      "Guides school direction, learning standards, staff culture and family partnership.",
    icon: "user-round",
    imageDescription:
      "Placeholder portrait for the principal of Divine International School.",
  },
  {
    title: "Head of Academics",
    role: "Teaching and learning",
    description:
      "Supports curriculum quality, teacher development, assessment and pupil progress.",
    icon: "book-open",
    imageDescription:
      "Placeholder portrait for the Head of Academics at Divine International School.",
  },
  {
    title: "Head of Administration",
    role: "School operations",
    description:
      "Coordinates reliable systems, communication, facilities and daily school operations.",
    icon: "briefcase",
    imageDescription:
      "Placeholder portrait for the Head of Administration at Divine International School.",
  },
  {
    title: "Student Support Lead",
    role: "Wellbeing and development",
    description:
      "Promotes pupil wellbeing, positive behaviour, belonging and personal development.",
    icon: "heart",
    imageDescription:
      "Placeholder portrait for the Student Support Lead at Divine International School.",
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
