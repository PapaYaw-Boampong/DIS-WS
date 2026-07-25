import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Megaphone, Newspaper } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import {
  listCmsCalendar,
  listCmsEvents,
  listCmsNews,
} from "@/lib/portal/data/cms";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Website Content" };

export default async function WebsiteContentPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const [news, events, terms] = await Promise.all([
    listCmsNews(),
    listCmsEvents(),
    listCmsCalendar(),
  ]);

  const published = (items: readonly { status: string }[]) =>
    items.filter((item) => item.status === "published").length;

  const sections = [
    {
      title: "News & updates",
      description:
        "Notices, community updates and event highlights on the public News page.",
      href: portalRoutes.adminWebsiteNews,
      icon: <Newspaper aria-hidden="true" className="size-5" />,
      total: news.length,
      live: published(news),
    },
    {
      title: "Events",
      description:
        "Event cards shown on the school calendar page and the homepage.",
      href: portalRoutes.adminWebsiteEvents,
      icon: <Megaphone aria-hidden="true" className="size-5" />,
      total: events.length,
      live: published(events),
    },
    {
      title: "School calendar",
      description: "Academic term structure shown on the public calendar page.",
      href: portalRoutes.adminWebsiteCalendar,
      icon: <CalendarDays aria-hidden="true" className="size-5" />,
      total: terms.length,
      live: published(terms),
    },
  ];

  return (
    <>
      <DashboardHeader
        eyebrow="Administration"
        title="Website content"
        description="Manage the public website's news, events and school calendar. Published changes appear on the live site."
        badge="Live content"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {sections.map((section) => (
          <MetricCard
            key={section.title}
            label={section.title}
            value={`${section.live} live`}
            detail={`${section.total} total (incl. drafts)`}
            icon={section.icon}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {sections.map((section) => (
          <DashboardCard
            key={section.title}
            title={section.title}
            description={section.description}
          >
            <Link
              href={section.href}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
            >
              Manage
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </DashboardCard>
        ))}
      </div>
    </>
  );
}
