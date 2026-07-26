import type { FastifyInstance } from "fastify";

import { requireUser } from "../lib/auth-guard";
import { prisma } from "../db";

// Direct messaging. Each response is viewer-relative: counterpart, preview,
// unread and per-message `fromMe` are derived for the requesting user.
type ConversationWithGraph = Awaited<
  ReturnType<typeof loadConversationsForUser>
>[number];

async function loadConversationsForUser(userId: string) {
  const rows = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: { include: { user: true } },
          messages: {
            orderBy: { sentAt: "asc" },
            include: { author: true },
          },
        },
      },
    },
  });
  return rows;
}

function serializeConversation(
  row: ConversationWithGraph,
  actorId: string,
  actorRole: string,
) {
  const convo = row.conversation;
  const others = convo.participants
    .filter((participant) => participant.userId !== actorId)
    .map((participant) => participant.user.name);
  const messages = convo.messages.map((message) => ({
    id: message.id,
    author: {
      id: message.author.id,
      name: message.author.name,
      role: message.author.role.toLowerCase(),
    },
    body: message.body,
    sentAt: message.sentAt.toISOString(),
    fromMe: message.authorId === actorId,
  }));
  const last = convo.messages[convo.messages.length - 1];
  const updatedAt = (last?.sentAt ?? convo.createdAt).toISOString();
  const unread = Boolean(
    last &&
      last.authorId !== actorId &&
      (!row.lastReadAt || row.lastReadAt < last.sentAt),
  );

  return {
    id: convo.id,
    subject: convo.subject,
    counterpart: others.join(", ") || "School",
    audience: actorRole,
    preview: last?.body ?? "",
    unread,
    updatedAt,
    messages,
  };
}

export async function messageRoutes(app: FastifyInstance): Promise<void> {
  app.get("/me/conversations", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const rows = await loadConversationsForUser(actor.id);
    const conversations = rows
      .map((row) => serializeConversation(row, actor.id, actor.role))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return reply.send({ conversations });
  });

  // Send a reply into a conversation the actor participates in.
  app.post("/me/conversations/:id/messages", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: actor.id } },
    });
    if (!participant) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const body = (
      request.body as { body?: string } | undefined
    )?.body?.trim();
    if (!body) {
      return reply.code(400).send({ error: "empty_message" });
    }

    const now = new Date();
    const message = await prisma.message.create({
      data: { conversationId: id, authorId: actor.id, body, sentAt: now },
      include: { author: true },
    });
    // The sender has necessarily seen their own message.
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId: actor.id } },
      data: { lastReadAt: now },
    });

    return reply.code(201).send({
      message: {
        id: message.id,
        author: {
          id: message.author.id,
          name: message.author.name,
          role: message.author.role.toLowerCase(),
        },
        body: message.body,
        sentAt: message.sentAt.toISOString(),
        fromMe: true,
      },
    });
  });

  // Mark a conversation read up to now for the actor.
  app.post("/me/conversations/:id/read", async (request, reply) => {
    const actor = await requireUser(request, reply);
    if (!actor) return;

    const { id } = request.params as { id: string };
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: actor.id } },
    });
    if (!participant) {
      return reply.code(403).send({ error: "forbidden" });
    }

    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId: id, userId: actor.id } },
      data: { lastReadAt: new Date() },
    });

    return reply.send({ ok: true });
  });
}
