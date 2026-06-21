import { routes } from "@/lib/routes";
import { siteImages } from "@/lib/images";
import type { EventItem } from "@/types/content";

export const featuredEvents = [
  {
    title: "Career Day at Divine",
    date: "School community activity",
    description:
      "Pupils explore different professions through creative dress, conversation and shared activities.",
    href: `${routes.studentLife}#gallery`,
    actionLabel: "Explore the Gallery",
    icon: "briefcase",
    image: siteImages.careerDay,
  },
] satisfies readonly EventItem[];

export const calendarEvents = [
  {
    title: "Career Day",
    date: "School activity programme",
    description:
      "A practical opportunity for pupils to learn about professions and imagine future pathways.",
    href: routes.calendar,
    icon: "briefcase",
    image: siteImages.careerDay,
  },
  {
    title: "Colour Day",
    date: "School celebration",
    description:
      "A colourful community activity that encourages participation, creativity and shared enjoyment.",
    href: routes.calendar,
    icon: "palette",
    image: siteImages.colourDay,
  },
  {
    title: "School Competitions",
    date: "Activity programme",
    description:
      "Team activities give pupils opportunities to participate, cooperate and practise healthy competition.",
    href: routes.calendar,
    icon: "trophy",
    image: siteImages.competition,
  },
  {
    title: "Educational Excursions",
    date: "Learning beyond the classroom",
    description:
      "Supervised visits connect classroom learning with community spaces and practical experience.",
    href: routes.calendar,
    icon: "compass",
    image: siteImages.excursion,
  },
  {
    title: "Graduation Celebration",
    date: "School milestone",
    description:
      "The school community recognises learner progress and celebrates an important transition.",
    href: routes.calendar,
    icon: "graduation-cap",
    image: siteImages.graduation,
  },
] satisfies readonly EventItem[];
