import type { FastifyInstance } from "fastify";

import { requireRole, requireUser } from "../lib/auth-guard";
import { resolveParent } from "../lib/current-parent";
import { prisma } from "../db";

const FINANCE = ["admin", "accounts"] as const;

export async function walletRoutes(app: FastifyInstance): Promise<void> {
  app.get("/feeding-balances", async (request, reply) => {
    if (!(await requireRole(request, reply, FINANCE))) return;
    return reply.send({ balances: await prisma.feedingBalance.findMany() });
  });

  app.get("/transport-wallet-balances", async (request, reply) => {
    if (!(await requireRole(request, reply, FINANCE))) return;
    return reply.send({
      balances: await prisma.transportWalletBalance.findMany(),
    });
  });

  app.get("/wallet-transactions", async (request, reply) => {
    if (!(await requireRole(request, reply, FINANCE))) return;
    return reply.send({
      transactions: await prisma.walletTransaction.findMany(),
    });
  });

  // Parent: feeding + transport wallet balances and transactions for their
  // children.
  app.get("/me/wallets", async (request, reply) => {
    const user = await requireUser(request, reply);
    if (!user) return;
    const parent = await resolveParent(user.id);
    if (!parent) {
      return reply.send({ feeding: [], transport: [], transactions: [] });
    }
    const where = { studentId: { in: parent.childIds } };
    const [feeding, transport, transactions] = await Promise.all([
      prisma.feedingBalance.findMany({ where }),
      prisma.transportWalletBalance.findMany({ where }),
      prisma.walletTransaction.findMany({ where }),
    ]);
    return reply.send({ feeding, transport, transactions });
  });
}
