import "server-only";

import { mockParents } from "@/data/portal/parents";
import { mockStudents } from "@/data/portal/students";
import { getMockPortalSession } from "@/lib/portal/mock-session";

export async function getMockParentPortalContext() {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "parent") {
    return null;
  }

  const parent = mockParents.find(
    (item) => item.userId === session.user.id,
  );

  if (!parent) {
    return null;
  }

  const students = mockStudents.filter((student) =>
    parent.childIds.includes(student.id),
  );

  return {
    session,
    parent,
    students,
  };
}
