import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import {
  ModuleItemStatusBadge,
  moduleItemTypeLabels,
} from "@/components/portal/course/ModuleItemBadge";
import { listCourseModules } from "@/lib/portal/data/academics";
import { resolveCourseAccess } from "@/lib/portal/course";
import { formatPortalDate } from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";
import type { CourseModuleItem } from "@/types/portal";

export const metadata: Metadata = {
  title: "Module Item",
};

type ModuleItemPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
    moduleId: string;
    itemId: string;
  }>;
};

const itemPreviewCopy: Record<CourseModuleItem["type"], string> = {
  page: "This module item is a reading page. Rich page content is not part of this frontend preview.",
  assignment:
    "This module item links to graded work for the course. Open it from the Assignments tab for due date and submission details.",
  material:
    "This module item shares a course file. File delivery is planned for a later storage phase and is not part of this preview.",
  quiz: "This module item is a quiz check. Quiz building and auto-grading are not part of this frontend preview.",
  discussion:
    "This module item is a discussion prompt. Threaded replies are not part of this frontend preview.",
};

export default async function ModuleItemPage({
  params,
}: ModuleItemPageProps) {
  const { role: rawRole, courseId, moduleId, itemId } = await params;
  const access = await resolveCourseAccess(rawRole, courseId);

  if (!access) {
    notFound();
  }

  const { role } = access;
  const courseModule = (await listCourseModules()).find(
    (item) => item.id === moduleId && item.courseId === courseId,
  );
  const moduleItem = courseModule?.items.find((item) => item.id === itemId);

  if (!courseModule || !moduleItem) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={portalRoutes.courseModules(role, courseId)}
        className="inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Modules
      </Link>

      <DashboardCard
        title={moduleItem.title}
        description={`${courseModule.title} · ${moduleItemTypeLabels[moduleItem.type]}`}
        action={<ModuleItemStatusBadge item={moduleItem} />}
      >
        <p className="leading-7 text-muted-grey">
          {itemPreviewCopy[moduleItem.type]}
        </p>

        {moduleItem.dueDate ? (
          <p className="mt-4 text-sm font-bold text-charcoal">
            Due {formatPortalDate(moduleItem.dueDate)}
          </p>
        ) : null}

        {moduleItem.type === "assignment" ? (
          <Link
            href={portalRoutes.courseAssignments(role, courseId)}
            className="mt-6 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            View in Assignments
          </Link>
        ) : null}
      </DashboardCard>
    </div>
  );
}
