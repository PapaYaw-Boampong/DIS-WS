import type { FastifyRequest } from "fastify";

import { prisma } from "../db";
import type { PublicUser } from "./serialize";

// Fire-and-log, never fire-and-throw: a broken audit insert must not take down
// the business action it's recording. Failures are logged server-side instead.
export async function recordAudit(
  request: FastifyRequest,
  input: {
    actor: PublicUser | null;
    action: string;
    targetType: string;
    targetId?: string | null;
    summary?: string;
  },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actor?.id ?? null,
        actorRole: input.actor?.role ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        summary: input.summary?.slice(0, 2000) ?? null,
        requestId: request.id,
        ip: request.ip,
        userAgent: (request.headers["user-agent"] as string | undefined) ?? null,
      },
    });
  } catch (error) {
    request.log.error({ err: error }, "audit log write failed");
  }
}
