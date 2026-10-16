import { PrismaClient } from "@prisma/client";

import { consumeBackupCode, issueBackupCodes } from "../src/lib/mfa";
import { generateCode, generateSecret, verifyCode } from "../src/lib/totp";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: "admin@dis.local" },
  });
  console.log("mfaEnabledAt:", user?.mfaEnabledAt);
  console.log("mfaLastUsedCounter:", user?.mfaLastUsedCounter);

  const secret = generateSecret();
  const now = new Date();
  const counter = verifyCode(secret, generateCode(secret, now), now);
  console.log("current counter:", counter);

  // Backup-code round trip in isolation.
  const probe = await prisma.user.findFirst({ where: { email: "parent@dis.local" } });
  if (!probe) throw new Error("probe user missing");

  const codes = await issueBackupCodes(probe.id);
  console.log("issued sample:", codes.slice(0, 2));
  console.log("consume with dashes:", await consumeBackupCode(probe.id, codes[0]!));
  console.log("consume same again:", await consumeBackupCode(probe.id, codes[0]!));
  console.log("consume without dashes:", await consumeBackupCode(probe.id, codes[1]!.replace("-", "")));
  console.log("consume lowercase:", await consumeBackupCode(probe.id, codes[2]!.toLowerCase()));
  console.log("consume garbage:", await consumeBackupCode(probe.id, "ZZZZZ-ZZZZZ"));

  await prisma.mfaBackupCode.deleteMany({ where: { userId: probe.id } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
