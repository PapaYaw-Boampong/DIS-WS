import "server-only";

import {
  mockAssignments,
  mockAttendance,
  mockCourseModules,
  mockCourses,
  mockDailyAttendance,
  mockGradebookEntries,
  mockLearningResources,
  mockResults,
  mockTimetable,
} from "@/data/portal/academics";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import type {
  AssignmentSubmission,
  AssignmentSummary,
  AttendanceSummary,
  CourseModule,
  CourseSummary,
  DailyAttendanceRecord,
  GradebookEntry,
  LearningResource,
  ResultSummary,
  TimetableEntry,
} from "@/types/portal";

export async function listCourses(): Promise<readonly CourseSummary[]> {
  if (!useRealPortalAuth) return mockCourses;
  return (await portalApiGet<{ courses?: CourseSummary[] }>("/courses", {}))
    .courses ?? [];
}

export async function listCourseModules(): Promise<readonly CourseModule[]> {
  if (!useRealPortalAuth) return mockCourseModules;
  return (
    await portalApiGet<{ modules?: CourseModule[] }>("/course-modules", {})
  ).modules ?? [];
}

export async function listAssignments(): Promise<readonly AssignmentSummary[]> {
  if (!useRealPortalAuth) return mockAssignments;
  return (
    await portalApiGet<{ assignments?: AssignmentSummary[] }>("/assignments", {})
  ).assignments ?? [];
}

export async function listTimetable(): Promise<readonly TimetableEntry[]> {
  if (!useRealPortalAuth) return mockTimetable;
  return (await portalApiGet<{ timetable?: TimetableEntry[] }>("/timetable", {}))
    .timetable ?? [];
}

export async function listResources(): Promise<readonly LearningResource[]> {
  if (!useRealPortalAuth) return mockLearningResources;
  return (
    await portalApiGet<{ resources?: LearningResource[] }>(
      "/learning-resources",
      {},
    )
  ).resources ?? [];
}

export async function listResults(): Promise<readonly ResultSummary[]> {
  if (!useRealPortalAuth) return mockResults;
  return (await portalApiGet<{ results?: ResultSummary[] }>("/results", {}))
    .results ?? [];
}

export async function listAttendanceSummaries(): Promise<
  readonly AttendanceSummary[]
> {
  if (!useRealPortalAuth) return mockAttendance;
  return (
    await portalApiGet<{ attendance?: AttendanceSummary[] }>(
      "/attendance-summaries",
      {},
    )
  ).attendance ?? [];
}

export async function listDailyAttendance(): Promise<
  readonly DailyAttendanceRecord[]
> {
  if (!useRealPortalAuth) return mockDailyAttendance;
  return (
    await portalApiGet<{ dailyAttendance?: DailyAttendanceRecord[] }>(
      "/daily-attendance",
      {},
    )
  ).dailyAttendance ?? [];
}

export async function listGradebook(): Promise<readonly GradebookEntry[]> {
  if (!useRealPortalAuth) return mockGradebookEntries;
  return (await portalApiGet<{ gradebook?: GradebookEntry[] }>("/gradebook", {}))
    .gradebook ?? [];
}

// Real-file-storage submission reads. Mock mode has no fictional submission
// data (the mock portal never modelled uploaded files), so both return empty
// until the flag is on — matching the assignment page's previous "requires a
// later file-storage phase" placeholder.
export async function listSubmissionsForAssignment(
  assignmentId: string,
): Promise<readonly AssignmentSubmission[]> {
  if (!useRealPortalAuth) return [];
  return (
    await portalApiGet<{ submissions?: AssignmentSubmission[] }>(
      `/assignments/${encodeURIComponent(assignmentId)}/submissions`,
      {},
    )
  ).submissions ?? [];
}

export async function getMySubmission(
  assignmentId: string,
): Promise<AssignmentSubmission | null> {
  if (!useRealPortalAuth) return null;
  return (
    await portalApiGet<{ submission?: AssignmentSubmission | null }>(
      `/assignments/${encodeURIComponent(assignmentId)}/submissions/me`,
      {},
    )
  ).submission ?? null;
}
