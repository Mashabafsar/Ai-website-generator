/**
 * Drops every existing account into HubSpot as a lead with the +5 login score,
 * for accounts created before the CRM integration or that haven't opened the
 * portal since. Safe to re-run: the login score is awarded once per account.
 *
 * Dry run by default. Run with `npm run hubspot:backfill -- --apply` to write.
 */

import { prisma } from "@/lib/prisma";
import { CrmScoreAction } from "@/lib/crm/config";
import { redact } from "@/lib/crm/hubspot-client";
import { ensureLeadRegistered } from "@/lib/crm/scoring";
import { runCrmOutbox } from "@/lib/crm/sync";

async function main() {
  const apply = process.argv.includes("--apply");

  const registered = await prisma.crmScoreEvent.findMany({
    where: { action: CrmScoreAction.REGISTERED },
    select: { userId: true },
  });
  const done = new Set(registered.map((e) => e.userId));
  const users = await prisma.user.findMany({ select: { id: true }, orderBy: { createdAt: "asc" } });
  const pending = users.filter((u) => !done.has(u.id));

  console.log(`${users.length} accounts, ${pending.length} not yet dropped into HubSpot as leads.`);
  if (!apply) {
    console.log("Dry run. Re-run with --apply to queue them and sync to HubSpot.");
    return;
  }

  for (const user of pending) {
    await ensureLeadRegistered(user.id);
  }
  console.log(`Queued ${pending.length} contact syncs. Syncing to HubSpot...`);

  let totals = { processed: 0, failed: 0 };
  for (;;) {
    const result = await runCrmOutbox(25);
    if (result.disabled) {
      console.error("HUBSPOT_API_KEY is unset; jobs stay queued for the next drain.");
      process.exit(1);
    }
    totals = {
      processed: totals.processed + result.processed,
      failed: totals.failed + result.failed,
    };
    if (result.processed + result.failed + result.skipped === 0) break;
  }
  console.log(`Synced ${totals.processed}, failed ${totals.failed}. Failures retry on the next drain.`);
}

main()
  .catch((err) => {
    console.error(redact(err instanceof Error ? err.message : String(err)));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
