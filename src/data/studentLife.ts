import { routes } from "@/lib/routes";
import { createPageMetadata } from "@/lib/metadata";
import { imageById, siteImages } from "@/lib/images";
import type {
  StudentActivity,
  StudentLifeSlide,
  StudentVoice,
} from "@/types/content";

export const studentLifeMetadata = createPageMetadata({
  title: "Student Life",
  description:
    "Explore student life at Divine International School, including campus experiences, activities, voices and the complete school photo gallery.",
  path: routes.studentLife,
});

export const studentLifeHero = {
  title: "Student Life",
  description:
    "Friendships, reading corners, the Edu Lab, lunchtime chatter, stage performances and graduation day — life at Divine is full, joyful and well looked after.",
  primaryAction: {
    label: "Apply Now",
    href: routes.admissions,
  },
  secondaryAction: {
    label: "Explore School",
    href: "#experience",
  },
  image: siteImages.studentLifeHero,
  images: [
    siteImages.studentLifeHero,
    siteImages.studentLifeHero2,
    siteImages.studentLifeHero3,
    imageById["events-graduation-dance-dance2"],
    imageById["events-graduation-play-p4"],
    imageById["events-competitions-group3"],
    imageById["events-escursions-group-3"],
  ],
} as const;

export const experienceSlides = [
  {
    id: "safe-environment",
    eyebrow: "Experience",
    title: "The Divine International School Experience",
    description:
      "A safe and supportive learning environment where children grow academically, socially, morally and creatively.",
    imageLabel: "Supportive school experience",
    imageDescription:
      "A Divine graduating class celebrating together.",
    icon: "heart",
    image: siteImages.graduation,
  },
  {
    id: "confident-participation",
    eyebrow: "Confidence",
    title: "Participation builds confidence",
    description:
      "Classroom routines, school activities and shared responsibilities help pupils practise communication, teamwork and self-belief.",
    imageLabel: "Confident participation",
    imageDescription:
      "A pupil speaking confidently at a school ceremony.",
    icon: "sparkles",
    image: siteImages.studentConfidence,
  },
  {
    id: "whole-child-growth",
    eyebrow: "Growth",
    title: "Learning beyond academics",
    description:
      "Student life supports friendships, discipline, creativity and the character habits children need beyond the classroom.",
    imageLabel: "Whole-child growth",
    imageDescription:
      "A pupil receiving an award at graduation.",
    icon: "shield-check",
    image: siteImages.achievement,
  },
] satisfies readonly StudentLifeSlide[];

// "A Day at Divine": the school day in order, from arrival to lunch.
export const campusSlides = [
  {
    id: "arrival",
    eyebrow: "Morning",
    title: "Safe arrival",
    description:
      "School buses bring pupils in from across a wide catchment, and the day begins with a warm welcome and settled routines.",
    imageLabel: "School bus arrival",
    imageDescription: "A Divine International School bus parked on campus.",
    icon: "bus",
    image: siteImages.dayArrival,
  },
  {
    id: "lessons",
    eyebrow: "Lessons",
    title: "Focused learning in bright classrooms",
    description:
      "Clear teaching, guided practice and independent work keep every learner engaged and moving forward.",
    imageLabel: "Classroom lesson",
    imageDescription: "Pupils at work during a classroom lesson.",
    icon: "school",
    image: siteImages.dayLessons,
  },
  {
    id: "library",
    eyebrow: "Reading",
    title: "Time in the library",
    description:
      "Quiet reading, research and shared stories build vocabulary, curiosity and a lasting love of books.",
    imageLabel: "Library reading",
    imageDescription: "A smiling pupil reading in the school library.",
    icon: "library",
    image: siteImages.dayLibrary,
  },
  {
    id: "edu-lab",
    eyebrow: "Edu Lab",
    title: "Digital skills, guided well",
    description:
      "Computer lessons and the interactive digital board help pupils practise, create and solve problems with confidence.",
    imageLabel: "Edu Lab lesson",
    imageDescription: "Pupils working together at computers in the Edu Lab.",
    icon: "monitor",
    image: siteImages.dayEduLab,
  },
  {
    id: "lunch",
    eyebrow: "Lunch",
    title: "Meals and friendship",
    description:
      "Freshly prepared meals in a supervised dining space — and plenty of conversation with friends.",
    imageLabel: "Lunchtime",
    imageDescription: "Young pupils sharing lunch together.",
    icon: "utensils",
    image: siteImages.dayLunch,
  },
] satisfies readonly StudentLifeSlide[];

export const activitySlides = [
  {
    id: "clubs",
    eyebrow: "Activities",
    title: "Clubs and interests",
    description:
      "Structured clubs give pupils time to discover interests, practise skills and enjoy learning with peers.",
    imageLabel: "Clubs and interests",
    imageDescription:
      "Pupils in a creative presentation on stage.",
    icon: "puzzle",
    image: siteImages.creativeConfidence,
  },
  {
    id: "sports",
    eyebrow: "Activities",
    title: "Sports and wellbeing",
    description:
      "Movement, teamwork and healthy competition support discipline, confidence and physical wellbeing.",
    imageLabel: "Sports and wellbeing",
    imageDescription:
      "Pupils performing a dance at a school celebration.",
    icon: "trophy",
    image: siteImages.dance,
  },
  {
    id: "arts-culture",
    eyebrow: "Activities",
    title: "Arts and culture",
    description:
      "Creative opportunities in art, music and performance help pupils express ideas and collaborate.",
    imageLabel: "Arts and culture",
    imageDescription:
      "Pupils performing a cultural play.",
    icon: "palette",
    image: siteImages.culturalPlay,
  },
  {
    id: "leadership-service",
    eyebrow: "Activities",
    title: "Leadership and service",
    description:
      "Age-appropriate roles and service experiences encourage responsibility, empathy and contribution.",
    imageLabel: "Leadership and service",
    imageDescription:
      "A pupil reciting on stage at a school ceremony.",
    icon: "handshake",
    image: siteImages.recital,
  },
] satisfies readonly StudentLifeSlide[];

export const activityPillars = [
  {
    title: "Discipline",
    description:
      "Clear expectations help pupils practise responsibility in class, activities and community spaces.",
    icon: "shield-check",
  },
  {
    title: "Friendship",
    description:
      "Group activities create natural opportunities for pupils to listen, cooperate and build friendships.",
    icon: "heart",
  },
  {
    title: "Creativity",
    description:
      "Creative tasks and performances give pupils space to explore ideas and develop confidence.",
    icon: "palette",
  },
] satisfies readonly StudentActivity[];

export const studentVoices = [
  {
    id: "family-partnership",
    eyebrow: "Family Voice",
    role: "Parent perspective",
    title: "Families are part of the journey",
    description:
      "Communication between school and home helps families understand routines, expectations and learner progress.",
    imageLabel: "Family partnership",
    imageDescription:
      "Parents and their daughter receiving an award at the Divine graduation ceremony.",
    icon: "users",
    image: siteImages.voiceParents,
  },
  {
    id: "learner-confidence",
    eyebrow: "Student Voice",
    role: "Learner perspective",
    title: "Confidence grows through participation",
    description:
      "Learners are encouraged to ask questions, join activities and recognise progress through consistent effort.",
    imageLabel: "Learner confidence",
    imageDescription:
      "A confident Junior High student smiling in class.",
    icon: "sparkles",
    image: siteImages.juniorHighLeadership,
  },
  {
    id: "community-belonging",
    eyebrow: "Community Voice",
    role: "School community",
    title: "A warm place to belong",
    description:
      "Daily routines, celebrations and shared responsibilities help pupils feel connected to the school community.",
    imageLabel: "School belonging",
    imageDescription:
      "A happy pupil reading in the Divine school library.",
    icon: "heart",
    image: siteImages.studentBelonging,
  },
] satisfies readonly StudentVoice[];
