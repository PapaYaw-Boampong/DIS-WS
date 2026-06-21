import { routes } from "@/lib/routes";
import { createPageMetadata } from "@/lib/metadata";
import { siteImages } from "@/lib/images";
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
    "A nurturing school community committed to academic excellence, discipline and character development.",
  primaryAction: {
    label: "Apply Now",
    href: routes.admissions,
  },
  secondaryAction: {
    label: "Explore School",
    href: "#experience",
  },
  image: siteImages.studentLifeHero,
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
      "Placeholder for an approved photograph showing pupils participating in a supportive Divine International School environment.",
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
      "Placeholder for an approved photograph of pupils confidently participating in a school activity.",
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
      "Placeholder for an approved photograph representing whole-child growth at Divine International School.",
    icon: "shield-check",
    image: siteImages.achievement,
  },
] satisfies readonly StudentLifeSlide[];

export const campusSlides = [
  {
    id: "classroom-spaces",
    eyebrow: "Campus",
    title: "Purposeful classroom spaces",
    description:
      "Learning spaces are organised to support clear instruction, group work, practice and daily routines.",
    imageLabel: "Classroom and learning spaces",
    imageDescription:
      "Placeholder for an approved photograph of classroom and learning spaces on the Divine International School campus.",
    icon: "school",
    image: siteImages.earlyLearningGallery,
  },
  {
    id: "community-spaces",
    eyebrow: "Campus",
    title: "Spaces for school community",
    description:
      "Shared campus areas give pupils places to gather, celebrate, collaborate and take part in supervised school life.",
    imageLabel: "Campus community spaces",
    imageDescription:
      "Placeholder for an approved photograph of pupils using a shared campus area at Divine International School.",
    icon: "users",
    image: siteImages.graduation,
  },
  {
    id: "activity-spaces",
    eyebrow: "Campus",
    title: "Room for activity and discovery",
    description:
      "Indoor and outdoor experiences help pupils connect learning with movement, creativity and exploration.",
    imageLabel: "Activity and discovery spaces",
    imageDescription:
      "Placeholder for an approved photograph of an activity space at Divine International School.",
    icon: "compass",
    image: siteImages.scienceGallery,
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
      "Placeholder for an approved photograph of pupils taking part in a supervised school club.",
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
      "Placeholder for an approved photograph of pupils participating in a school sport or movement activity.",
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
      "Placeholder for an approved photograph of pupils participating in creative arts or cultural activity.",
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
      "Placeholder for an approved photograph of pupils taking part in a leadership or service activity.",
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
      "Placeholder for an approved photograph representing family partnership at Divine International School.",
    icon: "users",
    image: siteImages.awardGallery,
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
      "Placeholder for an approved photograph representing learner confidence and participation.",
    icon: "sparkles",
    image: siteImages.studentConfidence,
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
      "Placeholder for an approved photograph representing belonging within the Divine school community.",
    icon: "heart",
    image: siteImages.graduation,
  },
] satisfies readonly StudentVoice[];
