import { routes } from "@/lib/routes";
import type { EventItem } from "@/types/content";

export const featuredEvents = [
  {
    title: "End of Term Celebration",
    date: "End of Term",
    description:
      "Join the school community as we celebrate student progress, achievement and a successful term.",
    href: routes.calendar,
    icon: "calendar",
  },
] satisfies readonly EventItem[];

export const calendarEvents = [
  {
    title: "Family Progress Meetings",
    date: "Scheduled each term",
    description:
      "Dedicated conversations between families and teachers about learner progress, strengths and next steps.",
    href: routes.calendar,
    icon: "users",
  },
  {
    title: "Co-curricular Showcase",
    date: "Academic year programme",
    description:
      "A school community event highlighting pupil participation in sport, clubs, art, music and performance.",
    href: routes.calendar,
    icon: "trophy",
  },
  {
    title: "End of Term Celebration",
    date: "End of term",
    description:
      "A celebration of progress, effort and achievement across the Divine school community.",
    href: routes.calendar,
    icon: "calendar",
  },
] satisfies readonly EventItem[];
