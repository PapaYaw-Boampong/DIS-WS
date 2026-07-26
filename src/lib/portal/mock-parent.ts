import "server-only";

import { mockParents } from "@/data/portal/parents";
import { mockStudents } from "@/data/portal/students";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { ParentProfile, StudentProfile } from "@/types/portal";

export async function getMockParentPortalContext() {
  const session = await getMockPortalSession();

  if (!session || session.user.role !== "parent") {
    return null;
  }

  if (useRealPortalAuth) {
    const data = await portalApiGet<{
      parent: ParentProfile | null;
      children: StudentProfile[];
    }>("/me/children", { parent: null, children: [] });

    if (!data.parent) {
      return null;
    }

    return { session, parent: data.parent, students: data.children };
  }

  const parent = mockParents.find((item) => item.userId === session.user.id);

  if (!parent) {
    return null;
  }

  const students = mockStudents.filter((student) =>
    parent.childIds.includes(student.id),
  );

  return { session, parent, students };
}
