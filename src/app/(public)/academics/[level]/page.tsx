import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AcademicLevelContent } from "@/components/academics/AcademicLevelContent";
import { CTASection } from "@/components/ui/CTASection";
import { PageHero } from "@/components/ui/PageHero";
import {
  academicLevels,
  getAcademicLevelDetail,
} from "@/data/academics";
import { createPageMetadata } from "@/lib/metadata";
import { routes } from "@/lib/routes";

type AcademicLevelPageProps = {
  params: Promise<{ level: string }>;
};

export function generateStaticParams() {
  return academicLevels.map(({ slug }) => ({ level: slug }));
}

export async function generateMetadata({
  params,
}: AcademicLevelPageProps): Promise<Metadata> {
  const { level } = await params;
  const detail = getAcademicLevelDetail(level);

  if (!detail) {
    return createPageMetadata({
      title: "Academic Level Not Found",
      description: "The requested academic level is not available.",
      path: routes.academics,
    });
  }

  return createPageMetadata({
    title: detail.title,
    description: detail.heroDescription,
    path: routes.academicLevel(detail.slug),
  });
}

export default async function AcademicLevelPage({
  params,
}: AcademicLevelPageProps) {
  const { level } = await params;
  const detail = getAcademicLevelDetail(level);

  if (!detail) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={detail.eyebrow}
        title={detail.title}
        description={detail.heroDescription}
        image={detail.heroImage}
        preloadImage={Boolean(detail.heroImage)}
        variant="orange"
      />
      <AcademicLevelContent level={detail} />
      <CTASection
        title={`Explore admission to ${detail.title}`}
        description="Contact our team to discuss placement, school expectations and the next steps for joining Divine International School."
        primaryLabel="Apply Now"
        primaryHref={routes.admissions}
        secondaryLabel="View All Academics"
        secondaryHref={routes.academics}
      />
    </>
  );
}
