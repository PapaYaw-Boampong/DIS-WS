import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ClipboardCheck, FilePenLine, LayoutList } from "lucide-react";

import { CourseCards } from "@/components/portal/course/CourseCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { listAssignments, listCourses } from "@/lib/portal/data/academics";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Courses",
};

type CoursesPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

async function StudentCoursesView() {
  const context = await getMockStudentPortalContext();

  if (!context) {
    notFound();
  }

  const openTodo = context.assignments.filter(
    (assignment) => assignment.status !== "submitted",
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.student.className} courses`}
        title="My courses"
        description="Open a course to see its modules, assignments, materials and grades on its own page."
        badge="Mock LMS"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <MetricCard
          label="Courses"
          value={String(context.courses.length)}
          detail="Current term"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="To Do"
          value={String(openTodo.length)}
          detail="Open tasks"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
      </div>

      <section className="mt-8">
        <CourseCards courses={context.courses} role="student" />
      </section>
    </>
  );
}

async function StaffCoursesView() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const [allCourses, allAssignments] = await Promise.all([
    listCourses(),
    listAssignments(),
  ]);
  const courses = allCourses.filter(
    (course) =>
      context.staff.classIds.includes(course.classId) &&
      (context.staff.subjectIds.includes(course.subjectId) ||
        course.teacher === context.staff.fullName),
  );
  const courseIds = courses.map((course) => course.id);
  const assignments = allAssignments.filter(
    (assignment) =>
      assignment.courseId && courseIds.includes(assignment.courseId),
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.staff.title} · ${context.staff.staffId}`}
        title="Courses"
        description="Open a course to manage its modules, assignments and materials on its own page."
        badge="Mock LMS"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetricCard
          label="Courses"
          value={String(courses.length)}
          detail="Assigned course shells"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Assignments"
          value={String(assignments.length)}
          detail="Across your courses"
          icon={<LayoutList aria-hidden="true" className="size-5" />}
        />
        <Link
          href={portalRoutes.staffAssignmentNew}
          className="flex items-center justify-between gap-4 rounded-3xl border border-curry-orange bg-soft-cream p-6 text-left transition-colors hover:bg-white"
        >
          <span>
            <span className="block text-base font-extrabold text-charcoal">
              Create assignment
            </span>
            <span className="mt-1 block text-sm text-muted-grey">
              Open the creation page
            </span>
          </span>
          <FilePenLine aria-hidden="true" className="size-5 text-deep-orange" />
        </Link>
      </div>

      <section className="mt-8">
        <CourseCards courses={courses} role="staff" />
      </section>
    </>
  );
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  if (role === "student") {
    return <StudentCoursesView />;
  }

  if (role === "staff") {
    return <StaffCoursesView />;
  }

  notFound();
}
