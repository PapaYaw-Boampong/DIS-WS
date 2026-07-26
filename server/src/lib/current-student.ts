import type { Student } from "@prisma/client";

import { prisma } from "../db";

export async function resolveStudent(userId: string): Promise<Student | null> {
  return prisma.student.findFirst({ where: { userId } });
}
