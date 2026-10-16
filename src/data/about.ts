import { routes } from "@/lib/routes";
import { createPageMetadata } from "@/lib/metadata";
import { siteImages } from "@/lib/images";
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
  mummyMessage: createPageMetadata({
    title: "A Message from Mummy",
    description:
      "Co-Director Vivian Agbeme Boampong, known to our pupils as Mummy, on the potential in every child and the care it takes to draw it out.",
    path: routes.mummyMessage,
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
    siteImages.aboutHero,
    siteImages.aboutHero2,
    siteImages.aboutHero3,
    siteImages.aboutHero4,
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
    image: siteImages.mvvMission,
  },
  {
    title: "Our Vision",
    description:
      "To be a trusted school community where every learner develops the knowledge, confidence and character to thrive in school, in life and in service to others.",
    icon: "eye",
    image: siteImages.mvvVision,
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

// Co-Director Vivian Agbeme Boampong, affectionately "Mummy" to the pupils.
export const mummyProfile: LeaderProfile & {
  readonly quote: string;
  readonly action: LinkAction;
} = {
  title: "Co-Director",
  role: "Known to our pupils as Mummy",
  name: "Vivian Agbeme Boampong",
  description:
    "A mother of four who sees every child in our care as her own, and holds each of them to the same high hopes.",
  imageDescription:
    "Vivian Agbeme Boampong, Co-Director of Divine International School.",
  image: siteImages.mummyPortrait,
  icon: "user-round",
  quote:
    "Every child has the potential to change the world. The care and attention we give them decides how much of it they reach.",
  action: {
    label: "Read Mummy's Message",
    href: routes.mummyMessage,
  },
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

export const mummyMessageSections = [
  {
    paragraphs: [
      "Welcome to Divine International School. Many of our pupils — and more than a few of their parents — know me simply as Mummy. I carry that name with pride, because it describes exactly how I see every child who walks through our gates.",
    ],
  },
  {
    heading: "Every child can change the world",
    paragraphs: [
      "I believe every child carries immense potential — enough to change the world. But potential does not unlock itself. It is drawn out through teaching: patient, purposeful and demanding teaching, given by people who truly believe in the child in front of them.",
      "Whether a child grows into a leader or loses their way is shaped, more than anything, by the care and attention we give them. A child who is noticed, guided and expected to do well rises to meet that expectation. A child who is overlooked can drift. At Divine, no child is overlooked.",
    ],
  },
  {
    heading: "What I asked of my own four",
    paragraphs: [
      "I am a mother of four, and these are not ideas I hold at a distance. I raised my own children on them — encouraging them, pushing them and never giving them a moment to settle for less than they were capable of. I have seen for myself what steady care and high expectations can build.",
      "Every child in our care receives the same from me. I see them all as my own, and I hold each of them to the same high hopes I held for my four. Our teachers share that commitment: to know each child, to challenge them, and to stand beside them until their potential becomes achievement.",
    ],
  },
  {
    heading: "Our promise to your family",
    paragraphs: [
      "When you entrust your child to Divine, you are welcoming a family that will care for them, believe in them and keep them reaching higher. I look forward to welcoming you, and to watching your child grow.",
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
      "Kwame Wireko Boampong, Co-Director of Divine International School.",
    image: siteImages.coDirectorKwame,
  },
  {
    title: "Co-Director",
    role: "School direction & governance",
    name: "Vivian Agbeme Boampong",
    description:
      "Provides overall direction, governance and stewardship of the school's vision and growth.",
    icon: "user-round",
    imageDescription:
      "Vivian Agbeme Boampong, Co-Director of Divine International School.",
    image: siteImages.coDirectorVivian,
  },
  {
    title: "Principal / Headmaster",
    role: "Basic & Junior High",
    name: "Kwasi Ohene",
    description:
      "Leads teaching standards, staff culture, pupil wellbeing and family partnership across Basic and JHS.",
    icon: "graduation-cap",
    imageDescription:
      "Placeholder portrait for the Principal of Divine International School.",
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
    image: siteImages.cultureKnown,
  },
  {
    title: "Character matters",
    description:
      "Respect, integrity, responsibility and service are reinforced through everyday school life.",
    icon: "shield-check",
    image: siteImages.cultureCharacter,
  },
  {
    title: "Learning has purpose",
    description:
      "Pupils are encouraged to ask questions, solve problems and apply their learning with confidence.",
    icon: "sparkles",
    image: siteImages.culturePurpose,
  },
  {
    title: "Safe and disciplined",
    description:
      "Clear, consistent routines create a secure setting where children feel free to participate and try.",
    icon: "shield-check",
    image: siteImages.cultureSafe,
  },
  {
    title: "Faith and values",
    description:
      "Our Christian ethos nurtures gratitude, kindness and a strong moral compass in every learner.",
    icon: "heart",
    image: siteImages.cultureFaith,
  },
  {
    title: "Families in partnership",
    description:
      "Open communication keeps parents close to their child's progress and school life.",
    icon: "handshake",
    image: siteImages.cultureFamilies,
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
    title: "A Message from Mummy",
    description: "Our Co-Director on the potential in every child.",
    href: routes.mummyMessage,
    icon: "quote",
  },
  {
    title: "Leadership & Management",
    description: "Learn about the roles guiding our school community.",
    href: routes.leadership,
    icon: "users",
  },
] as const;
