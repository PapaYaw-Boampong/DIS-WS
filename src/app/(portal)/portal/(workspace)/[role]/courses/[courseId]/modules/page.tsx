import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  ModuleItemStatusBadge,
  moduleItemIcons,
  moduleItemTypeLabels,
} from "@/components/portal/course/ModuleItemBadge";
import { listCourseModules } from "@/lib/portal/data/academics";
import { resolveCourseAccess } from "@/lib/portal/course";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Course Modules",
};

type CourseModulesPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

export default async function CourseModulesPage({
  params,
}: CourseModulesPageProps) {
  const { role: rawRole, courseId } = await params;
  const access = await resolveCourseAccess(rawRole, courseId);

  if (!access) {
    notFound();
  }

  const { role } = access;
  const modules = (await listCourseModules())
    .filter((module) => module.courseId === courseId)
    .slice()
    .sort((first, second) => first.position - second.position);

  if (!modules.length) {
    return (
      <DashboardCard
        title="Modules"
        description="No modules are published for this course yet."
      >
        <p className="text-sm text-muted-grey">
          Check back once the teacher publishes course content.
        </p>
      </DashboardCard>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map((module) => (
        <DashboardCard
          key={module.id}
          title={module.title}
          description={module.description}
          action={
            <StatusBadge
              variant={module.status === "published" ? "success" : "warning"}
            >
              {module.status === "published" ? "Published" : "Draft"}
            </StatusBadge>
          }
        >
          {module.items.length ? (
            <ul className="divide-y divide-border">
              {module.items.map((item) => {
                const Icon = moduleItemIcons[item.type];

                return (
                  <li key={item.id}>
                    <Link
                      href={portalRoutes.courseModuleItem(
                        role,
                        courseId,
                        module.id,
                        item.id,
                      )}
                      className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-deep-orange"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-cream text-curry-orange">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <span>
                          <span className="block font-bold text-charcoal">
                            {item.title}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold tracking-wide text-muted-grey uppercase">
                            {moduleItemTypeLabels[item.type]}
                          </span>
                        </span>
                      </span>
                      <ModuleItemStatusBadge item={item} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-2 text-sm text-muted-grey">
              No items in this module yet.
            </p>
          )}
        </DashboardCard>
      ))}
    </div>
  );
}
