import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { NewsImagePlaceholder } from "@/components/news/NewsImagePlaceholder";
import { routes } from "@/lib/routes";
import type { NewsArticle } from "@/types/content";

type NewsCardProps = {
  article: NewsArticle;
  featured?: boolean;
};

export function NewsCard({ article, featured = false }: NewsCardProps) {
  if (featured) {
    return (
      <article className="grid overflow-hidden rounded-card border border-border bg-white shadow-card lg:grid-cols-[0.9fr_1.1fr]">
        <NewsImagePlaceholder
          article={article}
          className="rounded-none border-0 border-b border-border lg:border-r lg:border-b-0"
        />
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-sm font-extrabold tracking-[0.14em] text-curry-orange uppercase">
            {article.category} <span aria-hidden="true">·</span>{" "}
            {article.publishedAt}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl">
            {article.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-grey">
            {article.excerpt}
          </p>
          <Link
            href={routes.newsArticle(article.slug)}
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
          >
            Read More
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-white shadow-card">
      <NewsImagePlaceholder
        article={article}
        className="rounded-none border-0 border-b border-border"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
          {article.category} <span aria-hidden="true">·</span>{" "}
          {article.publishedAt}
        </p>
        <h2 className="mt-3 text-xl font-bold text-charcoal">
          {article.title}
        </h2>
        <p className="mt-3 flex-1 leading-7 text-muted-grey">
          {article.excerpt}
        </p>
        <Link
          href={routes.newsArticle(article.slug)}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
        >
          Read More
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
