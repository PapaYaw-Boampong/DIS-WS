import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { NewsImagePlaceholder } from "@/components/news/NewsImagePlaceholder";
import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getNewsArticle, newsArticles } from "@/data/news";
import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: "News Article Not Found",
      description: "The requested news article is not available.",
      path: routes.news,
    });
  }

  return createPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: routes.newsArticle(article.slug),
  });
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;
  const article = getNewsArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = newsArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={`${article.category} · ${article.publishedAt}`}
        title={article.title}
        description={article.excerpt}
        variant="orange"
        align="center"
      />
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <aside>
            <NewsImagePlaceholder
              article={article}
              className="lg:sticky lg:top-36"
            />
            <Link
              href={routes.news}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-curry-orange transition-colors hover:text-deep-orange"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to News
            </Link>
          </aside>

          <article className="max-w-3xl">
            {article.body.map((section, index) => (
              <section
                key={section.heading ?? index}
                className="border-b border-border py-8 first:pt-0 last:border-b-0"
              >
                {section.heading ? (
                  <h2 className="text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="mt-5 space-y-5 text-lg leading-8 text-muted-grey">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-12 rounded-card border border-border bg-soft-white p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-charcoal">
                Related updates
              </h2>
              <div className="mt-6 grid gap-4">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.slug}
                    href={routes.newsArticle(related.slug)}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 text-sm font-bold text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange"
                  >
                    <span>{related.title}</span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </Container>
      </section>
      <CTASection
        title="Explore more of school life"
        description="Visit the Student Life page or review the school calendar for activities, events and community moments."
        primaryLabel="Student Life"
        primaryHref={routes.studentLife}
        secondaryLabel="View Calendar"
        secondaryHref={routes.calendar}
      />
    </>
  );
}
