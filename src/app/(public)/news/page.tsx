import type { Metadata } from "next";

import { NewsCard } from "@/components/news/NewsCard";
import { CTASection } from "@/components/ui/CTASection";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { newsHero, newsMetadata } from "@/data/news";
import { getPublishedNews } from "@/lib/public-content";
import { routes } from "@/lib/routes";

export const metadata: Metadata = newsMetadata.listing;

export default async function NewsPage() {
  const [featuredArticle, ...otherArticles] = await getPublishedNews();

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
            description="Notices and updates published by the school administration."
            align="center"
          />
          {featuredArticle ? (
            <div className="mt-12">
              <NewsCard article={featuredArticle} featured />
            </div>
          ) : (
            <p className="mt-12 text-center text-muted-grey">
              There are no published updates at the moment. Please check back
              soon.
            </p>
          )}
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
