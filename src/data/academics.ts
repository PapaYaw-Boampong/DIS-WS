import type {
  AcademicCardItem,
  AcademicLevel,
  AcademicLevelDetail,
  AcademicTerm,
  FacultyMember,
  TeacherProfile,
} from "@/types/content";
import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const academicMetadata = {
  overview: createPageMetadata({
    title: "Academics",
    description:
      "Explore the academic levels, learning approach, teaching resources and assessment practices at Divine International School.",
    path: routes.academics,
  }),
  teachers: createPageMetadata({
    title: "Meet Our Teachers",
    description:
      "Learn about the teaching roles that support pupils across every stage at Divine International School.",
    path: routes.teachers,
  }),
  calendar: createPageMetadata({
    title: "School Calendar",
    description:
      "Review the 2026 academic year structure and upcoming school community events.",
    path: routes.calendar,
  }),
};

export const academicsHero = {
  eyebrow: "Academics",
  title: "Learning that builds knowledge, confidence and character",
  description:
    "Our academic programme combines strong foundations, purposeful teaching and opportunities for every learner to participate, practise and grow.",
} as const;

export const academicOverview = {
  eyebrow: "Our Approach",
  title: "Purposeful learning at every stage",
  paragraphs: [
    "Divine International School supports learners through clear instruction, active participation, guided practice and regular feedback.",
    "Academic progress is developed alongside curiosity, responsibility, communication and the confidence to apply learning in new situations.",
  ],
  imageLabel: "Teaching and learning at Divine",
  imageDescription:
    "Placeholder for an approved photograph of pupils participating in a classroom learning activity at Divine International School.",
} as const;

export const academicLevels = [
  {
    title: "Early Years",
    slug: "early-years",
    description:
      "A nurturing start that develops curiosity, confidence and strong learning foundations.",
    icon: "baby",
  },
  {
    title: "Primary School",
    slug: "primary",
    description:
      "Strong foundations in literacy, numeracy, science, creativity and character.",
    icon: "book-open",
  },
  {
    title: "Junior High",
    slug: "junior-high",
    description:
      "Preparing students for higher learning, independence and responsible leadership.",
    icon: "school",
  },
  // {
  //   title: "Co-curricular",
  //   slug: "co-curricular",
  //   description:
  //     "Sports, arts, clubs and service experiences that develop the whole learner.",
  //   icon: "trophy",
  // },
] satisfies readonly AcademicLevel[];

export const curriculumAreas = [
  {
    title: "Language & Literacy",
    description:
      "Reading, writing, speaking and listening experiences build clear communication and confident expression.",
    icon: "languages",
  },
  {
    title: "Mathematics",
    description:
      "Learners develop number fluency, logical reasoning and practical problem-solving strategies.",
    icon: "calculator",
  },
  {
    title: "Science & Discovery",
    description:
      "Observation, investigation and discussion help pupils understand the world around them.",
    icon: "flask",
  },
  {
    title: "Creative Expression",
    description:
      "Art, music and performance encourage imagination, collaboration and individual voice.",
    icon: "palette",
  },
] satisfies readonly AcademicCardItem[];

export const beyondClassroom: readonly AcademicCardItem[] = [
  {
    title: "Clubs & Interests",
    description:
      "Structured activities give pupils space to discover interests and practise new skills.",
    icon: "puzzle",
  },
  {
    title: "Sport & Wellbeing",
    description:
      "Movement, teamwork and healthy competition support physical confidence and resilience.",
    icon: "trophy",
  },
  {
    title: "Leadership & Service",
    description:
      "Age-appropriate responsibilities help learners contribute to school and community life.",
    icon: "handshake",
  },
];

export const learningResources: readonly AcademicCardItem[] = [
  {
    title: "Learning Materials",
    description:
      "Age-appropriate texts, practical materials and visual resources reinforce classroom instruction.",
    icon: "library",
  },
  {
    title: "Guided Technology",
    description:
      "Digital tools are introduced purposefully to support research, practice and creative work.",
    icon: "presentation",
  },
  {
    title: "Teacher Collaboration",
    description:
      "Teachers plan together, review learner needs and align support across each academic stage.",
    icon: "users",
  },
];

export const assessmentApproach = {
  eyebrow: "Assessment & Reporting",
  title: "Feedback that guides the next step",
  description:
    "Assessment is used to understand progress, identify support needs and help learners take ownership of improvement.",
  points: [
    "Classwork, practical tasks and observation",
    "Age-appropriate quizzes and formal checks",
    "Constructive feedback and targeted support",
    "Clear progress communication with families",
  ],
} as const;

const levelDetails = [
  {
    slug: "early-years",
    title: "Early Years",
    eyebrow: "Learning Through Discovery",
    heroDescription:
      "A secure, playful and language-rich environment where young learners build confidence and strong foundations.",
    overviewTitle: "A warm beginning to school life",
    overviewParagraphs: [
      "Early Years learning is organised around purposeful play, conversation, movement, stories and guided exploration.",
      "Teachers establish consistent routines and responsive support so children can develop independence, friendships and readiness for more formal learning.",
    ],
    imageLabel: "Early Years learning environment",
    imageDescription:
      "Placeholder for an approved photograph of young learners engaged in a supervised Early Years activity.",
    subjects: [
      {
        title: "Communication & Language",
        description:
          "Stories, songs and conversation strengthen vocabulary, listening and confident expression.",
        icon: "languages",
      },
      {
        title: "Early Numeracy",
        description:
          "Practical activities introduce counting, patterns, comparison and mathematical language.",
        icon: "calculator",
      },
      {
        title: "Creative Discovery",
        description:
          "Art, music, movement and imaginative play encourage curiosity and self-expression.",
        icon: "palette",
      },
      {
        title: "Understanding Our World",
        description:
          "Guided observation helps children notice people, places, nature and everyday systems.",
        icon: "compass",
      },
    ],
    developmentFocus: [
      {
        title: "Independence",
        description:
          "Children practise routines, choices and simple responsibilities with caring guidance.",
        icon: "sparkles",
      },
      {
        title: "Relationships",
        description:
          "Shared play and group activities develop cooperation, empathy and respectful communication.",
        icon: "heart",
      },
      {
        title: "Physical Confidence",
        description:
          "Movement and fine-motor activities support coordination, control and healthy participation.",
        icon: "shapes",
      },
    ],
    assessmentTitle: "Observation-led assessment",
    assessmentDescription:
      "Teachers observe participation, language, practical skills and social development during everyday learning.",
    assessmentPoints: [
      "Learning observations and work samples",
      "Developmental progress notes",
      "Regular family communication",
    ],
    teacherSupportTitle: "Responsive support for each child",
    teacherSupportDescription:
      "Early Years teachers use routines, small-group guidance and individual encouragement to help every child feel secure and ready to learn.",
  },
  {
    slug: "primary",
    title: "Primary School",
    eyebrow: "Strong Foundations",
    heroDescription:
      "A structured programme that strengthens core skills, curiosity, responsibility and confidence across the curriculum.",
    overviewTitle: "Building capable and curious learners",
    overviewParagraphs: [
      "Primary learners deepen literacy and numeracy while exploring science, social understanding, creativity and practical problem solving.",
      "Lessons combine explicit teaching with discussion, guided practice and independent work so pupils can explain their thinking and apply new knowledge.",
    ],
    imageLabel: "Primary classroom learning",
    imageDescription:
      "Placeholder for an approved photograph of Primary pupils participating in a classroom lesson.",
    subjects: [
      {
        title: "English Language",
        description:
          "Reading, writing, grammar and oral communication support clear understanding and expression.",
        icon: "book-open",
      },
      {
        title: "Mathematics",
        description:
          "Number, measurement, geometry and reasoning build accuracy and problem-solving confidence.",
        icon: "calculator",
      },
      {
        title: "Science",
        description:
          "Questions, demonstrations and investigations develop scientific thinking and curiosity.",
        icon: "flask",
      },
      {
        title: "Creative & Social Learning",
        description:
          "Arts and social themes help pupils understand identity, community and creative communication.",
        icon: "palette",
      },
    ],
    developmentFocus: [
      {
        title: "Learning Habits",
        description:
          "Pupils practise organisation, persistence and thoughtful participation.",
        icon: "clipboard-check",
      },
      {
        title: "Communication",
        description:
          "Discussion and presentation build confidence in sharing ideas and listening to others.",
        icon: "presentation",
      },
      {
        title: "Character",
        description:
          "Daily expectations reinforce respect, responsibility, integrity and service.",
        icon: "shield-check",
      },
    ],
    assessmentTitle: "Balanced checks for understanding",
    assessmentDescription:
      "Teachers use classwork, projects and scheduled checks to monitor knowledge, skills and application.",
    assessmentPoints: [
      "Ongoing classroom assessment",
      "Projects and practical activities",
      "Term progress reports",
    ],
    teacherSupportTitle: "Teaching that responds to progress",
    teacherSupportDescription:
      "Teachers use feedback, small-group instruction and adjusted practice to consolidate foundations and extend confident learners.",
  },
  {
    slug: "junior-high",
    title: "Junior High",
    eyebrow: "Ready for the Next Stage",
    heroDescription:
      "Focused learning that develops deeper subject knowledge, independent study habits and responsible leadership.",
    overviewTitle: "Greater depth, independence and purpose",
    overviewParagraphs: [
      "Junior High learners engage with increasingly specialised content while strengthening analysis, communication and problem-solving skills.",
      "Teachers guide students to manage expectations, reflect on feedback and prepare confidently for the demands of higher learning.",
    ],
    imageLabel: "Junior High academic learning",
    imageDescription:
      "Placeholder for an approved photograph of Junior High students engaged in a subject lesson.",
    subjects: [
      {
        title: "Languages & Communication",
        description:
          "Reading, writing and speaking tasks develop comprehension, argument and accurate expression.",
        icon: "languages",
      },
      {
        title: "Mathematics",
        description:
          "Students apply numerical, algebraic and geometric reasoning to increasingly complex problems.",
        icon: "calculator",
      },
      {
        title: "Integrated Science",
        description:
          "Scientific concepts are explored through evidence, investigation and practical application.",
        icon: "flask",
      },
      {
        title: "Social & Creative Studies",
        description:
          "Learners examine society, citizenship, design and creative expression from multiple perspectives.",
        icon: "compass",
      },
    ],
    developmentFocus: [
      {
        title: "Independent Study",
        description:
          "Students learn to plan tasks, use feedback and take greater responsibility for progress.",
        icon: "clipboard-check",
      },
      {
        title: "Critical Thinking",
        description:
          "Lessons ask learners to compare evidence, explain reasoning and evaluate possible solutions.",
        icon: "puzzle",
      },
      {
        title: "Leadership",
        description:
          "Roles and collaborative work develop accountability, initiative and service.",
        icon: "graduation-cap",
      },
    ],
    assessmentTitle: "Evidence of knowledge and application",
    assessmentDescription:
      "A combination of continuous assessment and formal tasks measures understanding, accuracy and independent application.",
    assessmentPoints: [
      "Class assignments and projects",
      "Practical and written assessment",
      "Progress review and targeted support",
    ],
    teacherSupportTitle: "Guidance for confident progression",
    teacherSupportDescription:
      "Subject teachers provide clear expectations, specific feedback and focused intervention to prepare students for their next academic stage.",
  },
  {
    slug: "co-curricular",
    title: "Co-curricular Learning",
    eyebrow: "Beyond the Classroom",
    heroDescription:
      "Structured activities that help pupils discover interests, build teamwork and develop the whole person.",
    overviewTitle: "More ways to participate and grow",
    overviewParagraphs: [
      "Co-curricular learning extends the school experience through sport, creativity, clubs, leadership and service.",
      "Activities are designed to help pupils practise commitment, collaboration and confidence while discovering strengths beyond academic lessons.",
    ],
    imageLabel: "Co-curricular activity",
    imageDescription:
      "Placeholder for an approved photograph of pupils taking part in a supervised school club, sport or creative activity.",
    subjects: [
      {
        title: "Sport & Movement",
        description:
          "Team and individual activities develop coordination, fitness, discipline and sportsmanship.",
        icon: "trophy",
      },
      {
        title: "Music & Performance",
        description:
          "Music, drama and presentation give pupils opportunities to practise and perform together.",
        icon: "music",
      },
      {
        title: "Art & Making",
        description:
          "Creative projects develop imagination, patience, design thinking and practical skill.",
        icon: "palette",
      },
      {
        title: "Clubs & Service",
        description:
          "Interest groups and community activities encourage initiative, contribution and shared purpose.",
        icon: "handshake",
      },
    ],
    developmentFocus: [
      {
        title: "Teamwork",
        description:
          "Shared goals teach communication, reliability and respect for different strengths.",
        icon: "users",
      },
      {
        title: "Confidence",
        description:
          "Practice and performance help pupils take healthy risks and recognise progress.",
        icon: "sparkles",
      },
      {
        title: "Commitment",
        description:
          "Regular participation builds persistence, preparation and personal responsibility.",
        icon: "target",
      },
    ],
    assessmentTitle: "Growth through participation",
    assessmentDescription:
      "Progress is recognised through engagement, skill development, teamwork and responsible participation.",
    assessmentPoints: [
      "Participation and preparation",
      "Skill and confidence development",
      "Teamwork and responsible conduct",
    ],
    teacherSupportTitle: "Safe, structured activity leadership",
    teacherSupportDescription:
      "Staff guide activities with clear expectations, inclusive participation and age-appropriate coaching.",
  },
] satisfies readonly AcademicLevelDetail[];

export function getAcademicLevelDetail(slug: string) {
  return levelDetails.find((level) => level.slug === slug);
}

export const teacherProfiles = [
  {
    team: "early-years",
    title: "Early Years Teaching Team",
    role: "Foundation learning",
    description:
      "Creates secure routines and playful, language-rich experiences for the school's youngest learners.",
    icon: "baby",
    imageDescription:
      "Placeholder for an approved photograph of the Early Years teaching team.",
  },
  {
    team: "primary",
    title: "Primary Teaching Team",
    role: "Core foundations",
    description:
      "Builds literacy, numeracy, inquiry, creativity and positive learning habits across Primary.",
    icon: "book-open",
    imageDescription:
      "Placeholder for an approved photograph of the Primary teaching team.",
  },
  {
    team: "junior-high",
    title: "Junior High Teaching Team",
    role: "Subject depth",
    description:
      "Guides deeper subject learning, independent study and preparation for the next academic stage.",
    icon: "school",
    imageDescription:
      "Placeholder for an approved photograph of the Junior High teaching team.",
  },
  {
    team: "co-curricular",
    title: "Co-curricular Team",
    role: "Whole-child development",
    description:
      "Leads structured sport, creative, club and service opportunities beyond classroom lessons.",
    icon: "trophy",
    imageDescription:
      "Placeholder for an approved photograph of the co-curricular teaching team.",
  },
] satisfies readonly TeacherProfile[];

export const facultyMembers = [
  {
    team: "early-years",
    role: "Early Years Lead",
    displayName: "Name to be confirmed",
    description:
      "Coordinates foundation-stage planning, classroom routines and responsive support for young learners.",
    icon: "baby",
    imageDescription:
      "Placeholder portrait for the Early Years Lead at Divine International School.",
  },
  {
    team: "early-years",
    role: "Language & Literacy Teacher",
    displayName: "Name to be confirmed",
    description:
      "Builds early vocabulary, listening, storytelling and confident communication through guided play.",
    icon: "languages",
    imageDescription:
      "Placeholder portrait for an Early Years Language and Literacy teacher.",
  },
  {
    team: "early-years",
    role: "Early Numeracy Teacher",
    displayName: "Name to be confirmed",
    description:
      "Introduces number, pattern, comparison and mathematical language through practical activities.",
    icon: "calculator",
    imageDescription:
      "Placeholder portrait for an Early Years Numeracy teacher.",
  },
  {
    team: "early-years",
    role: "Creative Learning Teacher",
    displayName: "Name to be confirmed",
    description:
      "Guides art, music, movement and imaginative experiences that strengthen expression and confidence.",
    icon: "palette",
    imageDescription:
      "Placeholder portrait for an Early Years Creative Learning teacher.",
  },
  {
    team: "early-years",
    role: "Learning Support Teacher",
    displayName: "Name to be confirmed",
    description:
      "Provides individual encouragement and small-group support within daily Early Years routines.",
    icon: "heart",
    imageDescription:
      "Placeholder portrait for an Early Years Learning Support teacher.",
  },
  {
    team: "primary",
    role: "Primary School Lead",
    displayName: "Name to be confirmed",
    description:
      "Coordinates consistent teaching, assessment and learner support across the Primary stage.",
    icon: "book-open",
    imageDescription:
      "Placeholder portrait for the Primary School Lead at Divine International School.",
  },
  {
    team: "primary",
    role: "English Language Teacher",
    displayName: "Name to be confirmed",
    description:
      "Develops reading, writing, grammar and oral communication through structured practice.",
    icon: "languages",
    imageDescription:
      "Placeholder portrait for a Primary English Language teacher.",
  },
  {
    team: "primary",
    role: "Mathematics Teacher",
    displayName: "Name to be confirmed",
    description:
      "Builds number fluency, reasoning and confidence in applying mathematical strategies.",
    icon: "calculator",
    imageDescription:
      "Placeholder portrait for a Primary Mathematics teacher.",
  },
  {
    team: "primary",
    role: "Science Teacher",
    displayName: "Name to be confirmed",
    description:
      "Uses questions, demonstrations and practical investigation to strengthen scientific thinking.",
    icon: "flask",
    imageDescription:
      "Placeholder portrait for a Primary Science teacher.",
  },
  {
    team: "primary",
    role: "Primary Learning Support",
    displayName: "Name to be confirmed",
    description:
      "Provides targeted practice and classroom support in response to individual progress.",
    icon: "users",
    imageDescription:
      "Placeholder portrait for a Primary Learning Support teacher.",
  },
  {
    team: "junior-high",
    role: "Junior High Lead",
    displayName: "Name to be confirmed",
    description:
      "Coordinates subject teaching, assessment expectations and preparation for higher learning.",
    icon: "school",
    imageDescription:
      "Placeholder portrait for the Junior High Lead at Divine International School.",
  },
  {
    team: "junior-high",
    role: "Languages Teacher",
    displayName: "Name to be confirmed",
    description:
      "Develops comprehension, accurate expression and confident written and spoken communication.",
    icon: "languages",
    imageDescription:
      "Placeholder portrait for a Junior High Languages teacher.",
  },
  {
    team: "junior-high",
    role: "Mathematics Teacher",
    displayName: "Name to be confirmed",
    description:
      "Guides numerical, algebraic and geometric reasoning through increasingly complex problems.",
    icon: "calculator",
    imageDescription:
      "Placeholder portrait for a Junior High Mathematics teacher.",
  },
  {
    team: "junior-high",
    role: "Integrated Science Teacher",
    displayName: "Name to be confirmed",
    description:
      "Connects scientific concepts with evidence, investigation and practical application.",
    icon: "flask",
    imageDescription:
      "Placeholder portrait for a Junior High Integrated Science teacher.",
  },
  {
    team: "junior-high",
    role: "Student Development Teacher",
    displayName: "Name to be confirmed",
    description:
      "Supports independent study habits, responsible leadership and confident academic progression.",
    icon: "graduation-cap",
    imageDescription:
      "Placeholder portrait for a Junior High Student Development teacher.",
  },
  {
    team: "co-curricular",
    role: "Co-curricular Lead",
    displayName: "Name to be confirmed",
    description:
      "Coordinates safe, inclusive activities that extend learning beyond classroom lessons.",
    icon: "trophy",
    imageDescription:
      "Placeholder portrait for the Co-curricular Lead at Divine International School.",
  },
  {
    team: "co-curricular",
    role: "Sports Coach",
    displayName: "Name to be confirmed",
    description:
      "Develops movement, teamwork, discipline and sportsmanship through structured participation.",
    icon: "trophy",
    imageDescription:
      "Placeholder portrait for a Sports Coach at Divine International School.",
  },
  {
    team: "co-curricular",
    role: "Music & Performance Teacher",
    displayName: "Name to be confirmed",
    description:
      "Guides music, drama and performance practice that builds confidence and collaboration.",
    icon: "music",
    imageDescription:
      "Placeholder portrait for a Music and Performance teacher.",
  },
  {
    team: "co-curricular",
    role: "Art & Creative Projects Teacher",
    displayName: "Name to be confirmed",
    description:
      "Supports visual expression, practical making and patient development of creative ideas.",
    icon: "palette",
    imageDescription:
      "Placeholder portrait for an Art and Creative Projects teacher.",
  },
  {
    team: "co-curricular",
    role: "Clubs & Service Coordinator",
    displayName: "Name to be confirmed",
    description:
      "Guides interest groups and service activities that encourage initiative and shared purpose.",
    icon: "handshake",
    imageDescription:
      "Placeholder portrait for the Clubs and Service Coordinator.",
  },
] satisfies readonly FacultyMember[];

export const teachingPrinciples = [
  {
    title: "Know the Learner",
    description:
      "Teachers use observation, assessment and relationships to understand individual strengths and needs.",
    icon: "eye",
  },
  {
    title: "Teach with Clarity",
    description:
      "Learning goals, examples, practice and feedback help pupils understand what progress looks like.",
    icon: "target",
  },
  {
    title: "Learn Together",
    description:
      "Planning and professional collaboration strengthen consistency across classes and stages.",
    icon: "users",
  },
] satisfies readonly AcademicCardItem[];

export const academicTerms = [
  {
    name: "Term One",
    period: "Opening term",
    description:
      "Learners settle into routines, establish goals and begin the year's core programme.",
    highlights: [
      "Orientation and learning routines",
      "Baseline and continuous assessment",
      "Family progress communication",
    ],
  },
  {
    name: "Term Two",
    period: "Development term",
    description:
      "Teaching builds on established foundations through deeper practice, projects and school activities.",
    highlights: [
      "Curriculum development and projects",
      "Co-curricular participation",
      "Mid-year progress review",
    ],
  },
  {
    name: "Term Three",
    period: "Completion term",
    description:
      "Learners consolidate key outcomes, demonstrate progress and prepare for transition.",
    highlights: [
      "Consolidation and final assessment",
      "Celebration of learning",
      "Transition preparation",
    ],
  },
] satisfies readonly AcademicTerm[];
