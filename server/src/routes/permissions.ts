import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { requireRole, requireUser } from "../lib/auth-guard";
import { recordAudit } from "../lib/audit";
import {
  defaultCapabilityMatrix,
  getCapabilityMatrix,
  isPortalCapability,
  isPortalRole,
  portalRoles,
} from "../lib/capabilities";
import { prisma } from "../db";

const matrixSchema = z.object({
  matrix: z.record(z.string(), z.array(z.string())),
});

// Role permissions. Reading the full matrix and editing it are developer-only;
// every signed-in user can read their OWN capabilities so the portal knows what
// to render. Editing is gated on the `developer` ROLE, not on a capability —
// gating it on a capability would let the developer revoke it from themselves
// and lock the school out of its own permission screen.
export async function permissionRoutes(app: FastifyInstance): Promise<void> {
  // Readable by any signed-in user: the portal needs the matrix on every render
  // to decide what to show, and the matrix is configuration ("registry may
  // enrol learners"), not data. The shipped defaults are in the client bundle
  // already. Only the WRITE is restricted.
  app.get("/permissions", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    return reply.send({
      matrix: await getCapabilityMatrix(),
      defaults: defaultCapabilityMatrix,
    });
  });

  app.get("/me/capabilities", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const matrix = await getCapabilityMatrix();
    return reply.send({
      role: actor.role,
      capabilities: isPortalRole(actor.role) ? matrix[actor.role] : [],
    });
  });

  app.post("/permissions", async (request, reply) => {
    const actor = await requireRole(request, reply, ["developer"]);
    if (!actor) return;

    const parsed = matrixSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    // Unknown roles and unknown capability names are dropped rather than
    // rejected: a portal build that knows about a capability this server does
    // not should still be able to save the rest of the matrix.
    const before = await getCapabilityMatrix();
    const changed: string[] = [];

    for (const role of portalRoles) {
      const incoming = parsed.data.matrix[role];
      if (!incoming) continue;

      const capabilities = [...new Set(incoming.filter(isPortalCapability))];
      await prisma.roleCapability.upsert({
        where: { role },
        create: { role, capabilities, updatedById: actor.id },
        update: { capabilities, updatedById: actor.id },
      });

      const wasSet = [...before[role]].sort().join("|");
      const isSet = [...capabilities].sort().join("|");
      if (wasSet !== isSet) {
        changed.push(`${role}: ${wasSet || "none"} -> ${isSet || "none"}`);
      }
    }

    await recordAudit(request, {
      actor,
      action: "permissions.updated",
      targetType: "role_capabilities",
      summary: changed.join("; ") || "no change",
    });

    return reply.send({ matrix: await getCapabilityMatrix() });
  });

  // Restore the shipped defaults by deleting every override row.
  app.post("/permissions/reset", async (request, reply) => {
    const actor = await requireRole(request, reply, ["developer"]);
    if (!actor) return;

    await prisma.roleCapability.deleteMany({});
    await recordAudit(request, {
      actor,
      action: "permissions.reset",
      targetType: "role_capabilities",
      summary: "restored shipped defaults",
    });

    return reply.send({ matrix: defaultCapabilityMatrix });
  });
}
