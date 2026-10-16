import type { FastifyReply, FastifyRequest } from "fastify";

import { requireUser } from "./auth-guard";
import type { PublicUser } from "./serialize";
import { prisma } from "../db";

// What each portal role is allowed to do. This list and the defaults below
// mirror `src/lib/portal/capabilities.ts` in the web app — the portal uses them
// to decide what to show, the backend uses them to decide what to allow. The
// frontend copy is a convenience; THIS one is the authority.
export const portalCapabilities = [
  "students.view",
  "students.create",
  "students.import",
  "students.promote",
  "students.export",
  "parents.view",
  "parents.create",
  "staff.view",
  "staff.create",
  "classes.manage",
  "reportcards.publish",
  "documents.manage",
  "admissions.manage",
  "website.manage",
  "finance.manage",
  "transport.manage",
  "accounts.manage",
  "platform.readiness",
] as const;

export type PortalCapability = (typeof portalCapabilities)[number];

export const portalRoles = [
  "student",
  "parent",
  "staff",
  "admin",
  "registry",
  "developer",
  "accounts",
  "transport",
] as const;

export type PortalRole = (typeof portalRoles)[number];

export type CapabilityMatrix = Record<PortalRole, readonly PortalCapability[]>;

export const defaultCapabilityMatrix: CapabilityMatrix = {
  student: [],
  parent: [],
  staff: ["students.view", "reportcards.publish", "documents.manage"],
  admin: [
    "students.view",
    "students.export",
    "classes.manage",
    "reportcards.publish",
    "documents.manage",
    "website.manage",
    "finance.manage",
    "transport.manage",
  ],
  registry: [
    "students.view",
    "students.create",
    "students.import",
    "students.promote",
    "students.export",
    "parents.view",
    "parents.create",
    "staff.view",
    "staff.create",
    "classes.manage",
    "documents.manage",
    "admissions.manage",
  ],
  developer: ["accounts.manage", "platform.readiness"],
  accounts: ["finance.manage"],
  transport: ["transport.manage"],
};

export function isPortalCapability(value: string): value is PortalCapability {
  return portalCapabilities.some((capability) => capability === value);
}

export function isPortalRole(value: string): value is PortalRole {
  return portalRoles.some((role) => role === value);
}

// The stored matrix, falling back to the shipped defaults for any role that has
// never been edited. A role row with an empty array is a real "revoke all", not
// a missing row, so absence — not emptiness — is what triggers the default.
export async function getCapabilityMatrix(): Promise<CapabilityMatrix> {
  const rows = await prisma.roleCapability.findMany();
  const matrix = { ...defaultCapabilityMatrix };

  for (const row of rows) {
    if (!isPortalRole(row.role)) continue;
    matrix[row.role] = row.capabilities.filter(isPortalCapability);
  }

  return matrix;
}

export async function roleHasCapability(
  role: string,
  capability: PortalCapability,
): Promise<boolean> {
  if (!isPortalRole(role)) return false;
  const matrix = await getCapabilityMatrix();
  return matrix[role].includes(capability);
}

/**
 * Guard for a capability-gated route. Replaces a hardcoded `requireRole` list
 * wherever the school is allowed to move a responsibility between roles — the
 * answer comes from the stored matrix, so revoking a capability in the
 * developer portal actually stops the write rather than just hiding the button.
 */
export async function requireCapability(
  request: FastifyRequest,
  reply: FastifyReply,
  capability: PortalCapability,
): Promise<PublicUser | null> {
  const user = await requireUser(request, reply);
  if (!user) return null;

  if (!(await roleHasCapability(user.role, capability))) {
    await reply.code(403).send({ error: "forbidden", capability });
    return null;
  }

  return user;
}
