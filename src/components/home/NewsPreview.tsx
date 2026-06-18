import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { featuredNews } from "@/data/news";
import { routes } from "@/lib/routes";

export function NewsPreview() {
  return (
    <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader eyebrow="Updates" title="News & Updates" />
        <div className="mt-12 space-y-6">
          {featuredNews.map((article) => (
            <article
              key={article.slug}
              className="grid min-h-[360px] overflow-hidden rounded-card border border-border bg-white shadow-card lg:grid-cols-[0.9fr_1.1fr]"
            >
              <div
                role="img"
                aria-label={article.imageDescription}
                className="pattern-checker relative flex min-h-64 items-center justify-center overflow-hidden border-b border-border lg:min-h-full lg:border-r lg:border-b-0"
              >
                <div
                  className="absolute size-56 rounded-full bg-curry-orange/10"
                  aria-hidden="true"
                />
                <div className="relative flex size-20 items-center justify-center rounded-[1.5rem] bg-white text-curry-orange shadow-card">
                  <ContentIcon name={article.icon} className="size-9" />
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <p className="text-sm font-extrabold tracking-[0.14em] text-curry-orange uppercase">
                  {article.category} <span aria-hidden="true">·</span>{" "}
                  {article.publishedAt}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-charcoal sm:text-3xl">
                  {article.title}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted-grey sm:text-lg">
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
          ))}
        </div>
      </Container>
    </section>
  );
}
