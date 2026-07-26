import "server-only";

import { cache } from "react";

import { mockResults } from "@/data/portal/academics";
import { mockStudents } from "@/data/portal/students";
import {
  listAssignments,
  listCourseModules,
  listCourses,
  listResources,
  listTimetable,
} from "@/lib/portal/data/academics";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { ResultSummary, StudentProfile } from "@/types/portal";

// Wrapped in React's request cache: the course layout and each course tab
// page call this independently, and cache() dedupes those into one lookup
// per request instead of one per component.
export const getMockStudentPortalContext = cache(async () => {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "student") {
    return null;
  }

  const student: StudentProfile | null = useRealPortalAuth
    ? (
        await portalApiGet<{ student: StudentProfile | null }>("/me/student", {
          student: null,
        })
      ).student
    : (mockStudents.find((item) => item.userId === session.user.id) ?? null);

  if (!student) {
    return null;
  }

  const [allCourses, allModules, allAssignments, allResources, allTimetable] =
    await Promise.all([
      listCourses(),
      listCourseModules(),
      listAssignments(),
      listResources(),
      listTimetable(),
    ]);

  const courses = allCourses.filter(
    (course) => course.classId === student.classId,
  );
  const courseIds = courses.map((course) => course.id);
  const assignments = allAssignments.filter(
    (assignment) =>
      assignment.classId === student.classId &&
      (!assignment.courseId || courseIds.includes(assignment.courseId)),
  );
  const modules = allModules.filter((module) =>
    courseIds.includes(module.courseId),
  );
  const resources = allResources.filter(
    (resource) =>
      resource.classId === student.classId &&
      (!resource.courseId || courseIds.includes(resource.courseId)),
  );
  const timetable = allTimetable.filter(
    (entry) => entry.classId === student.classId,
  );
  const results: readonly ResultSummary[] = useRealPortalAuth
    ? ((await portalApiGet<{ results?: ResultSummary[] }>("/me/results", {}))
        .results ?? [])
    : mockResults.filter((result) => result.studentId === student.id);

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
});
