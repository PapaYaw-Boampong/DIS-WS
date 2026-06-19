import type { Metadata } from "next";

import { NewsCard } from "@/components/news/NewsCard";
import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { newsArticles, newsHero, newsMetadata } from "@/data/news";
import { routes } from "@/lib/routes";

export const metadata: Metadata = newsMetadata.listing;

export default function NewsPage() {
  const [featuredArticle, ...otherArticles] = newsArticles;

  return (
    <>
      <PageHero
        eyebrow={newsHero.eyebrow}
        title={newsHero.title}
        description={newsHero.description}
        image={newsHero.image}
        preloadImage
        variant="orange"
        align="center"
      />
      <section className="bg-soft-white py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="Latest"
            title="School notices and community updates"
            description="These static updates can later be replaced by an approved CMS or school administration feed."
            align="center"
          />
          <div className="mt-12">
            <NewsCard article={featuredArticle} featured />
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <SectionHeader
            eyebrow="More Updates"
            title="Read more from Divine"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherArticles.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Keep up with school events"
        description="Use the school calendar for planned term activities, family meetings and community events."
        primaryLabel="View Calendar"
        primaryHref={routes.calendar}
        secondaryLabel="Student Life"
        secondaryHref={routes.studentLife}
      />
    </>
  );
}
