import type { NewsArticle } from "@/types/content";
import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

export const newsMetadata = {
  listing: createPageMetadata({
    title: "News & Updates",
    description:
      "Read school notices, community updates and event highlights from Divine International School.",
    path: routes.news,
  }),
};

export const newsArticles = [
  {
    title: "School Reopens",
    slug: "school-reopens",
    excerpt:
      "A new term begins with renewed focus, warm welcomes and important information for every family.",
    publishedAt: "School Notice",
    category: "Updates",
    icon: "newspaper",
    imageDescription:
      "Placeholder for an approved photograph of pupils returning to school at the start of a term.",
    body: [
      {
        paragraphs: [
          "Divine International School welcomes families and learners into a new term with renewed focus on academic excellence, discipline and character development.",
          "Families should continue to follow official school communication for confirmed reopening details, class expectations and any required preparation.",
        ],
      },
      {
        heading: "What families can expect",
        paragraphs: [
          "The opening period helps pupils settle into routines, reconnect with teachers and understand expectations for learning and participation.",
          "Admissions and administration updates will be shared through the school's approved communication channels.",
        ],
      },
    ],
  },
  {
    title: "Family Progress Meetings",
    slug: "family-progress-meetings",
    excerpt:
      "Progress conversations help families and teachers discuss learner strengths, support needs and next steps.",
    publishedAt: "Calendar Update",
    category: "Families",
    icon: "users",
    imageDescription:
      "Placeholder for an approved photograph representing a family progress conversation with a teacher.",
    body: [
      {
        paragraphs: [
          "Family progress meetings are part of the school's commitment to clear communication between home and school.",
          "These conversations give families an opportunity to understand learner progress, celebrate effort and discuss areas where support may be helpful.",
        ],
      },
      {
        heading: "Preparing for the conversation",
        paragraphs: [
          "Families are encouraged to review recent school communication and prepare any questions about routines, homework, participation or learner confidence.",
          "Confirmed meeting arrangements will be provided directly by the school.",
        ],
      },
    ],
  },
  {
    title: "Co-curricular Showcase",
    slug: "co-curricular-showcase",
    excerpt:
      "A school community showcase highlights pupil participation in sport, clubs, creativity and service.",
    publishedAt: "Event Highlight",
    category: "Student Life",
    icon: "trophy",
    imageDescription:
      "Placeholder for an approved photograph of pupils participating in co-curricular activities.",
    body: [
      {
        paragraphs: [
          "Co-curricular learning gives pupils space to explore interests, practise teamwork and build confidence beyond classroom lessons.",
          "The showcase celebrates participation across sport, clubs, creative expression and age-appropriate leadership opportunities.",
        ],
      },
      {
        heading: "Whole-child growth",
        paragraphs: [
          "Activities beyond the classroom support discipline, commitment, friendship and a sense of belonging in the school community.",
          "Families should refer to the school calendar for confirmed event details.",
        ],
      },
    ],
  },
  {
    title: "Admissions Enquiries",
    slug: "admissions-enquiries",
    excerpt:
      "Families interested in joining Divine can prepare an enquiry and contact Admissions for current requirements.",
    publishedAt: "Admissions",
    category: "Admissions",
    icon: "clipboard-check",
    imageDescription:
      "Placeholder for an approved photograph representing a family admissions enquiry.",
    body: [
      {
        paragraphs: [
          "Families interested in Divine International School can begin by reviewing the admissions page and preparing an enquiry for the school team.",
          "Admissions will confirm current requirements, available stages and next steps for each family.",
        ],
      },
      {
        heading: "Current information",
        paragraphs: [
          "Fee schedules, document requirements and placement steps should be confirmed directly with Admissions before making enrollment decisions.",
          "The website enquiry form is presentational at this stage and does not submit an official application.",
        ],
      },
    ],
  },
] satisfies readonly NewsArticle[];

export const featuredNews = [newsArticles[0]] satisfies readonly NewsArticle[];

export function getNewsArticle(slug: string) {
  return newsArticles.find((article) => article.slug === slug);
}
