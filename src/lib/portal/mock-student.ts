import "server-only";

import {
  mockAssignments,
  mockCourseModules,
  mockCourses,
  mockLearningResources,
  mockResults,
  mockTimetable,
} from "@/data/portal/academics";
import { mockStudents } from "@/data/portal/students";
import { getMockPortalSession } from "@/lib/portal/mock-session";

export async function getMockStudentPortalContext() {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "student") {
    return null;
  }

  const student = mockStudents.find((item) => item.userId === session.user.id);

  if (!student) {
    return null;
  }

  const courses = mockCourses.filter(
    (course) => course.classId === student.classId,
  );
  const courseIds = courses.map((course) => course.id);
  const assignments = mockAssignments.filter(
    (assignment) =>
      assignment.classId === student.classId &&
      (!assignment.courseId || courseIds.includes(assignment.courseId)),
  );
  const modules = mockCourseModules.filter((module) =>
    courseIds.includes(module.courseId),
  );
  const resources = mockLearningResources.filter(
    (resource) =>
      resource.classId === student.classId &&
      (!resource.courseId || courseIds.includes(resource.courseId)),
  );
  const timetable = mockTimetable.filter(
    (entry) => entry.classId === student.classId,
  );
  const results = mockResults.filter((result) => result.studentId === student.id);

  return {
    session,
    student,
    courses,
    assignments,
    modules,
    resources,
    timetable,
    results,
  };
}
