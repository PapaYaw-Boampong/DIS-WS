import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

// Creates a single real ADMIN account so a fresh (unseeded) production database
// has a way in. That admin then creates all other accounts from the portal.
//
// Usage (values via flags or env):
//   npx tsx scripts/create-admin.ts --email head@school.edu --name "Head Teacher" --password "..."
//   ADMIN_EMAIL=... ADMIN_NAME="..." ADMIN_PASSWORD=... npx tsx scripts/create-admin.ts
//
// It refuses to overwrite an existing account and enforces an 8+ char password.

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const prisma = new PrismaClient();

async function main() {
  const email = (flag("email") ?? process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const name = flag("name") ?? process.env.ADMIN_NAME ?? "";
  const password = flag("password") ?? process.env.ADMIN_PASSWORD ?? "";

  if (!email || !email.includes("@")) {
    throw new Error("A valid --email (or ADMIN_EMAIL) is required.");
  }
  if (!name) {
    throw new Error("A --name (or ADMIN_NAME) is required.");
  }
  if (password.length < 8) {
    throw new Error("A --password (or ADMIN_PASSWORD) of at least 8 characters is required.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(`An account already exists for ${email} — refusing to overwrite.`);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: "ADMIN",
      passwordHash: await hashPassword(password),
    },
  });

  console.log(`Created admin account: ${user.email} (id ${user.id}).`);
  console.log("Sign in at the portal and create the remaining accounts from there.");
}

main()
  .catch((error) => {
    console.error(`create-admin failed: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
