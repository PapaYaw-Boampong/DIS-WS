import type { MetadataRoute } from "next";

import { academicLevels } from "@/data/academics";
import { newsArticles } from "@/data/news";
import { routes } from "@/lib/routes";
import { siteUrl } from "@/lib/site";

const staticRoutes = [
  routes.home,
  routes.about,
  routes.history,
  routes.principalMessage,
  routes.leadership,
  routes.academics,
  routes.teachers,
  routes.calendar,
  routes.admissions,
  routes.studentLife,
  routes.news,
  routes.portal,
  routes.contact,
  routes.location,
] as const;

function priorityForRoute(path: string) {
  if (path === routes.home) {
    return 1;
  }

  if (
    path === routes.admissions ||
    path === routes.academics ||
    path === routes.contact
  ) {
    return 0.9;
  }

  return 0.7;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const generatedRoutes = [
    ...staticRoutes,
    ...academicLevels.map((level) => routes.academicLevel(level.slug)),
    ...newsArticles.map((article) => routes.newsArticle(article.slug)),
  ];

  return generatedRoutes.map((path) => ({
    url: siteUrl(path),
    lastModified,
    changeFrequency: path === routes.news ? "weekly" : "monthly",
    priority: priorityForRoute(path),
  }));
}
