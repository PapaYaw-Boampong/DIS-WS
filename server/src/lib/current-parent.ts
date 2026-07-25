import type { Parent } from "@prisma/client";

import { prisma } from "../db";

// Resolves the Parent domain record for a logged-in parent user (Parent.userId
// links to the login account). Returns null if the account isn't a parent.
export async function resolveParent(userId: string): Promise<Parent | null> {
  return prisma.parent.findFirst({ where: { userId } });
}
