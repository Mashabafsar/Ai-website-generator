/**
 * Deactivate accounts older than 14 days with no website package payment and
 * no credit pack purchase. Admins and paying customers are never touched.
 *
 *   npm run accounts:deactivate           # dry run
 *   npm run accounts:deactivate -- --apply
 */

import { deactivateEligibleAccounts } from "@/lib/accounts/deactivation";
import { prisma } from "@/lib/prisma";

async function main() {
  const apply = process.argv.includes("--apply");
  const result = await deactivateEligibleAccounts({ dryRun: !apply });

  console.log(
    apply
      ? `Deactivated ${result.deactivated} account(s).`
      : `Dry run: ${result.eligible} account(s) would be deactivated.`
  );

  for (const account of result.accounts.slice(0, 50)) {
    console.log(`- ${account.email} (created ${account.createdAt.toISOString()})`);
  }
  if (result.accounts.length > 50) {
    console.log(`…and ${result.accounts.length - 50} more`);
  }

  if (!apply && result.eligible > 0) {
    console.log("Re-run with --apply to deactivate them.");
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
