import "server-only";

import { mockClasses } from "@/data/portal/academics";
import { mockStaff } from "@/data/portal/staff";
import { mockStudents } from "@/data/portal/students";
import { getMockPortalSession } from "@/lib/portal/mock-session";

export async function getMockStaffPortalContext() {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "staff") {
    return null;
  }

  const staff = mockStaff.find((item) => item.userId === session.user.id);

  if (!staff) {
    return null;
  }

  const classes = mockClasses.filter((classItem) =>
    staff.classIds.includes(classItem.id),
  );
  const students = mockStudents.filter((student) =>
    staff.classIds.includes(student.classId),
  );

  return {
    session,
    staff,
    classes,
    students,
  };
}
