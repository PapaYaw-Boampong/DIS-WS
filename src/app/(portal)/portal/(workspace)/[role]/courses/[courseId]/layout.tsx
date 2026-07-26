import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CourseNav } from "@/components/portal/course/CourseNav";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { resolveCourseAccess } from "@/lib/portal/course";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

type CourseLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

export default async function CourseLayout({
  children,
  params,
}: CourseLayoutProps) {
  const { role, courseId } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const access = await resolveCourseAccess(role, courseId);

  if (!access) {
    notFound();
  }

  const { course } = access;

  return (
    <>
      <Link
        href={
          access.role === "staff"
            ? portalRoutes.staffCourses
            : portalRoutes.studentCourses
        }
        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        All courses
      </Link>

      <DashboardHeader
        eyebrow={`${course.courseCode} · ${course.teacher}`}
        title={course.title}
        description={`${course.term} · Canvas-inspired course workspace with modules, assignments, grades and people in one place.`}
        badge="Mock LMS"
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <CourseNav role={access.role} courseId={courseId} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
