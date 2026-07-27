import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePenLine } from "lucide-react";

import { CourseCards } from "@/components/portal/course/CourseCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listCourses } from "@/lib/portal/data/academics";
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

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.student.className} courses`}
        title="My courses"
        description="Open a course to see its modules, assignments, materials and grades on its own page."
        badge="Mock LMS"
      />

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

  const allCourses = await listCourses();
  const courses = allCourses.filter(
    (course) =>
      context.staff.classIds.includes(course.classId) &&
      (context.staff.subjectIds.includes(course.subjectId) ||
        course.teacher === context.staff.fullName),
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.staff.title} · ${context.staff.staffId}`}
        title="Courses"
        description="Open a course to manage its modules, assignments and materials on its own page."
        badge="Mock LMS"
      />

      <div className="mt-8 flex justify-end">
        <Link
          href={portalRoutes.staffAssignmentNew}
          className="inline-flex items-center gap-2 rounded-full bg-curry-orange px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <FilePenLine aria-hidden="true" className="size-4" />
          Create assignment
        </Link>
      </div>

      <section className="mt-6">
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
