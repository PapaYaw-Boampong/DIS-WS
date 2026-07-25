import "server-only";

import { listCourses } from "@/lib/portal/data/academics";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import type { CourseSummary } from "@/types/portal";

export type CourseAccess = {
  readonly role: "student" | "staff";
  readonly course: CourseSummary;
};

// Central course-ownership check shared by the course layout and every
// course tab page: a student may open a course in their own class, staff may
// open a course they teach. Other roles have no course workspace yet.
export async function resolveCourseAccess(
  role: string,
  courseId: string,
): Promise<CourseAccess | null> {
  if (role === "student") {
    const context = await getMockStudentPortalContext();
    const course = context?.courses.find((item) => item.id === courseId);
    return course ? { role: "student", course } : null;
  }

  if (role === "staff") {
    const context = await getMockStaffPortalContext();

    if (!context) {
      return null;
    }

    const course = (await listCourses()).find(
      (item) =>
        item.id === courseId &&
        context.staff.classIds.includes(item.classId) &&
        (context.staff.subjectIds.includes(item.subjectId) ||
          item.teacher === context.staff.fullName),
    );
    return course ? { role: "staff", course } : null;
  }

  return null;
}
