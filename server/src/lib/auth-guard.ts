import type { FastifyReply, FastifyRequest } from "fastify";

import { toPublicUser, type PublicUser } from "./serialize";
import { getSessionUser } from "./session";

async function tokenUser(request: FastifyRequest): Promise<PublicUser | null> {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }
  const user = await getSessionUser(token);
  return user ? toPublicUser(user) : null;
}

export async function requireUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<PublicUser | null> {
  const user = await tokenUser(request);
  if (!user) {
    await reply.code(401).send({ error: "unauthenticated" });
    return null;
  }
  return user;
}

export async function requireRole(
  request: FastifyRequest,
  reply: FastifyReply,
  roles: readonly string[],
): Promise<PublicUser | null> {
  const user = await requireUser(request, reply);
  if (!user) {
    return null;
  }
  if (!roles.includes(user.role)) {
    await reply.code(403).send({ error: "forbidden" });
    return null;
  }
  return user;
}
