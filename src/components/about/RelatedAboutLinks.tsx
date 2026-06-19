import { ContentIcon } from "@/components/ui/ContentIcon";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { relatedAboutPages } from "@/data/about";

type RelatedAboutLinksProps = {
  excludeHref?: string;
};

export function RelatedAboutLinks({ excludeHref }: RelatedAboutLinksProps) {
  const links = relatedAboutPages.filter(
    (page) => page.href !== excludeHref,
  );

  return (
    <section className="bg-soft-white py-20 sm:py-24">
      <Container>
        <SectionHeader
          eyebrow="Explore More"
          title="Learn more about Divine"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {links.map((page) => (
            <Card
              key={page.href}
              title={page.title}
              description={page.description}
              href={page.href}
              icon={<ContentIcon name={page.icon} className="size-6" />}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
