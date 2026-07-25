import type { Staff } from "@prisma/client";

import { prisma } from "../db";

// Resolves the Staff domain record for a logged-in staff user (Staff.userId
// links to the login account). Returns null if the account isn't staff.
export async function resolveStaff(userId: string): Promise<Staff | null> {
  return prisma.staff.findFirst({ where: { userId } });
}

// Whether the actor may write to a class: admins may write to any class; staff
// only to classes they are assigned. Returns true/false.
export async function canWriteClass(
  actor: { id: string; role: string },
  classId: string,
): Promise<boolean> {
  if (actor.role === "admin") {
    return true;
  }
  const staff = await resolveStaff(actor.id);
  return Boolean(staff && staff.classIds.includes(classId));
}

// Scopes school-wide reads (results, attendance, gradebook) to the classes a
// staff member actually teaches — mirrors canWriteClass's write-side scoping.
// Returns null for admin (no restriction, sees every class); an array
// (possibly empty) of the staff member's own classIds otherwise.
export async function resolveReadableClassIds(
  actor: { id: string; role: string },
): Promise<string[] | null> {
  if (actor.role === "admin") {
    return null;
  }
  const staff = await resolveStaff(actor.id);
  return staff?.classIds ?? [];
}
