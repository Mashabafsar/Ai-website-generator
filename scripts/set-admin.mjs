// Grant or revoke admin access for a user by email.
//   node scripts/set-admin.mjs <email>            # grant
//   node scripts/set-admin.mjs <email> --revoke   # revoke
//
// The account must already exist (i.e. the user has signed up). The bootstrap
// allowlist in lib/auth/admin.ts also grants admin regardless of this flag.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2];
const revoke = process.argv.includes("--revoke");

if (!email) {
  console.error("Usage: node scripts/set-admin.mjs <email> [--revoke]");
  process.exit(1);
}

const user = await prisma.user.findFirst({
  where: { email: { equals: email } },
});

if (!user) {
  console.error(
    `No account found for ${email}. Have them sign up first, then re-run this.`
  );
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.user.update({
  where: { id: user.id },
  data: { isAdmin: !revoke },
});

console.log(`${revoke ? "Revoked admin from" : "Granted admin to"} ${email}.`);
await prisma.$disconnect();
