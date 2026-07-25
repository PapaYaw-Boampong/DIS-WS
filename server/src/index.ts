import cors from "@fastify/cors";
import Fastify from "fastify";

import { prisma } from "./db";
import { allowedOrigins, env } from "./env";
import { academicsRoutes } from "./routes/academics";
import { adminRoutes } from "./routes/admin";
import { auditRoutes } from "./routes/audit";
import { authRoutes } from "./routes/auth";
import { communicationRoutes } from "./routes/communication";
import { documentRoutes } from "./routes/documents";
import { financeRoutes } from "./routes/finance";
import { healthRoutes } from "./routes/health";
import { messageRoutes } from "./routes/messages";
import { peopleRoutes } from "./routes/people";
import { statementRoutes } from "./routes/statements";
import { transportRoutes } from "./routes/transport";
import { walletRoutes } from "./routes/wallets";

async function main(): Promise<void> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
    },
    // Bank-deposit receipts, statement CSVs, course materials, and assignment
    // submissions are sent as JSON (base64/text), so the body limit needs
    // headroom beyond Fastify's 1MB default (base64 inflates bytes ~33%).
    bodyLimit: 20 * 1024 * 1024,
  });

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  // Defense-in-depth for the file-download routes (payment attachments,
  // course materials, assignment submissions): even though upload mimeType is
  // now allowlisted, this stops a browser from ever sniffing a response body
  // as HTML/script regardless of the declared Content-Type.
  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("x-content-type-options", "nosniff");
    return payload;
  });

  // Several POST routes (verify, reject, mark-all-read, ...) take no body.
  // Fastify's default JSON parser rejects an empty body under
  // `content-type: application/json` with a 400 before the route handler (and
  // its auth check) ever runs — treat an empty body as `undefined` instead.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => {
      if (typeof body !== "string" || body.trim().length === 0) {
        done(null, undefined);
        return;
      }
      try {
        done(null, JSON.parse(body));
      } catch (error) {
        done(error as Error, undefined);
      }
    },
  );

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(adminRoutes);
  await app.register(peopleRoutes);
  await app.register(financeRoutes);
  await app.register(transportRoutes);
  await app.register(documentRoutes);
  await app.register(academicsRoutes);
  await app.register(walletRoutes);
  await app.register(communicationRoutes);
  await app.register(messageRoutes);
  await app.register(statementRoutes);
  await app.register(auditRoutes);

  async function shutdown(signal: string): Promise<void> {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  }

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
