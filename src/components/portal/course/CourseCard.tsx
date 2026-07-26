import Link from "next/link";
import { BookOpen } from "lucide-react";

import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { portalRoutes } from "@/lib/portal/routes";
import type { CourseSummary, PortalRole } from "@/types/portal";

type CourseCardsProps = {
  readonly courses: readonly CourseSummary[];
  readonly role: PortalRole;
};

export function CourseCards({ courses, role }: CourseCardsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <article
          key={course.id}
          className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-curry-orange uppercase">
                {course.courseCode}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-charcoal">
                {course.title}
              </h2>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-grey">
            {course.description}
          </p>
          <p className="mt-4 text-sm font-semibold text-charcoal">
            Teacher: {course.teacher}
          </p>
          <div className="mt-5">
            <ProgressMeter
              label="Course progress"
              value={course.progress}
              detail={course.term}
              tone={course.progress >= 65 ? "green" : "orange"}
            />
          </div>
          <Link
            href={portalRoutes.course(role, course.id)}
            className="mt-5 inline-flex min-h-10 w-fit items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            Open course
          </Link>
        </article>
      ))}
    </div>
  );
}
