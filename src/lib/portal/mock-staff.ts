import "server-only";

import { cache } from "react";

import { mockStaff } from "@/data/portal/staff";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { listClasses } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { StaffProfile } from "@/types/portal";

// Wrapped in React's request cache: the course layout and each course tab
// page call this independently, and cache() dedupes those into one lookup
// per request instead of one per component.
export const getMockStaffPortalContext = cache(async () => {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "staff") {
    return null;
  }

  const staff: StaffProfile | null = useRealPortalAuth
    ? (
        await portalApiGet<{ staff: StaffProfile | null }>("/me/staff", {
          staff: null,
        })
      ).staff
    : (mockStaff.find((item) => item.userId === session.user.id) ?? null);

  if (!staff) {
    return null;
  }

  const [allClasses, allStudents] = await Promise.all([
    listClasses(),
    listStudents(),
  ]);

  const classes = allClasses.filter((classItem) =>
    staff.classIds.includes(classItem.id),
  );
  const students = allStudents.filter(
    (student) =>
      Boolean(student.classId) && staff.classIds.includes(student.classId),
  );

  return {
    session,
    staff,
    classes,
    students,
  };
});
