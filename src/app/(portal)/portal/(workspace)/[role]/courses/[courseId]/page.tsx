import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Download,
  FilePenLine,
  FolderPlus,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { MetricCard } from "@/components/portal/MetricCard";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  listAssignments,
  listCourseModules,
  listGradebook,
  listResources,
} from "@/lib/portal/data/academics";
import { listClasses } from "@/lib/portal/data/people";
import { resolveCourseAccess } from "@/lib/portal/course";
import { formatPortalDate, percentageScore } from "@/lib/portal/format";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Course Home",
};

type CourseHomePageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

function average(scores: readonly { score: number; total: number }[]) {
  if (!scores.length) {
    return null;
  }

  const total = scores.reduce(
    (sum, entry) => sum + percentageScore(entry.score, entry.total),
    0,
  );
  return Math.round(total / scores.length);
}

export default async function CourseHomePage({
  params,
}: CourseHomePageProps) {
  const { role: rawRole, courseId } = await params;
  const access = await resolveCourseAccess(rawRole, courseId);

  if (!access) {
    notFound();
  }

  const { course, role } = access;
  const [modules, assignments, materials, classes] = await Promise.all([
    listCourseModules(),
    listAssignments(),
    listResources(),
    listClasses(),
  ]);
  const courseModules = modules.filter((item) => item.courseId === course.id);
  const courseAssignments = assignments.filter(
    (item) => item.courseId === course.id,
  );
  const courseMaterials = materials.filter(
    (item) => item.courseId === course.id,
  );
  const classSize = classes.find((item) => item.id === course.classId)
    ?.studentCount;
  const upcoming = [...courseAssignments]
    .filter((item) => item.status !== "submitted")
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .slice(0, 3);

  let gradeValue = "No grades yet";

  if (access.role === "student") {
    const studentContext = await getMockStudentPortalContext();
    const results = (studentContext?.results ?? []).filter(
      (result) => result.subject === course.subject,
    );
    const avg = average(results);
    gradeValue = avg === null ? "No grades yet" : `${avg}%`;
  } else {
    const entries = (await listGradebook()).filter(
      (entry) =>
        entry.classId === course.classId && entry.subject === course.subject,
    );
    const avg = average(entries);
    gradeValue = avg === null ? "No grades yet" : `${avg}% avg`;
  }

  return (
    <div className="space-y-8">
      <DashboardCard
        title="Course syllabus"
        description={`${course.term} overview for ${course.title}.`}
      >
        <p className="leading-7 text-muted-grey">{course.description}</p>
        <div className="mt-5 max-w-sm">
          <ProgressMeter
            label="Course progress"
            value={course.progress}
            detail={`${courseModules.length} module${courseModules.length === 1 ? "" : "s"} in this course`}
            tone={course.progress >= 65 ? "green" : "orange"}
          />
        </div>

        {access.role === "staff" ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`${portalRoutes.staffAssignmentNew}?courseId=${course.id}&classId=${course.classId}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
            >
              <FilePenLine aria-hidden="true" className="size-4" />
              Create assignment
            </Link>
            <Link
              href={portalRoutes.staffCourseMaterialNew(course.id)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              <FolderPlus aria-hidden="true" className="size-4" />
              Add material
            </Link>
          </div>
        ) : null}
      </DashboardCard>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Link href={portalRoutes.courseModules(role, course.id)} className="block">
          <MetricCard
            label="Modules"
            value={String(courseModules.length)}
            detail="Lessons, tasks and files"
            icon={<BookOpen aria-hidden="true" className="size-5" />}
          />
        </Link>
        <Link
          href={portalRoutes.courseAssignments(role, course.id)}
          className="block"
        >
          <MetricCard
            label="Assignments"
            value={String(courseAssignments.length)}
            detail={`${courseMaterials.length} material${courseMaterials.length === 1 ? "" : "s"} shared`}
            icon={<ClipboardList aria-hidden="true" className="size-5" />}
          />
        </Link>
        <Link href={portalRoutes.courseGrades(role, course.id)} className="block">
          <MetricCard
            label="Grades"
            value={gradeValue}
            detail={access.role === "student" ? "Your results" : "Class results"}
            icon={
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="size-5"
              />
            }
          />
        </Link>
        <Link href={portalRoutes.coursePeople(role, course.id)} className="block">
          <MetricCard
            label="People"
            value={classSize ? String(classSize) : "—"}
            detail={`Taught by ${course.teacher}`}
            icon={<Users aria-hidden="true" className="size-5" />}
          />
        </Link>
      </div>

      <DashboardCard
        title="Up next"
        description="The soonest open work in this course."
      >
        {upcoming.length ? (
          <ul className="divide-y divide-border">
            {upcoming.map((assignment) => (
              <li key={assignment.id}>
                <Link
                  href={portalRoutes.courseAssignmentDetail(
                    role,
                    course.id,
                    assignment.id,
                  )}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-deep-orange"
                >
                  <span>
                    <span className="block font-bold text-charcoal">
                      {assignment.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-grey">
                      Due {formatPortalDate(assignment.dueDate)}
                    </span>
                  </span>
                  <StatusBadge variant="warning">Open</StatusBadge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-grey">
            Nothing due soon in this course.
          </p>
        )}
      </DashboardCard>

      <DashboardCard
        title="Course materials"
        description="Files shared with this class."
      >
        {courseMaterials.length ? (
          <ul className="divide-y divide-border">
            {courseMaterials.map((material) => (
              <li
                key={material.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span>
                  <span className="block font-bold text-charcoal">
                    {material.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-grey">
                    {material.fileName} · Shared{" "}
                    {formatPortalDate(material.sharedAt)}
                  </span>
                </span>
                {material.objectKey ? (
                  <a
                    href={portalRoutes.courseMaterialDownload(
                      role,
                      course.id,
                      material.id,
                    )}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    Download
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-grey">
            No materials have been shared for this course yet.
          </p>
        )}
      </DashboardCard>
    </div>
  );
}
