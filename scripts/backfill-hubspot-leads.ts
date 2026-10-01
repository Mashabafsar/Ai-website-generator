/**
 * Drops every existing account into HubSpot as a lead with the +5 login score,
 * for accounts created before the CRM integration or that haven't opened the
 * portal since, and creates the HubSpot lead record for contacts that predate
 * lead records. With `--repair`, also re-syncs every contact that already has a
 * HubSpot id so existing Lead records pick up owner assignment and lead type.
 *
 * Dry run by default. Run with `npm run hubspot:backfill -- --apply` to write.
 * Add `--repair` with `--apply` to refresh existing leads.
 */

import { prisma } from "@/lib/prisma";
import { CrmJobKind, CrmScoreAction } from "@/lib/crm/config";
import { redact } from "@/lib/crm/hubspot-client";
import { enqueueCrmJob } from "@/lib/crm/outbox";
import { ensureLeadRegistered } from "@/lib/crm/scoring";
import { runCrmOutbox } from "@/lib/crm/sync";

async function main() {
  const apply = process.argv.includes("--apply");
  const repair = process.argv.includes("--repair");

  const registered = await prisma.crmScoreEvent.findMany({
    where: { action: CrmScoreAction.REGISTERED },
    select: { userId: true },
  });
  const done = new Set(registered.map((e) => e.userId));
  const users = await prisma.user.findMany({ select: { id: true }, orderBy: { createdAt: "asc" } });
  const pending = users.filter((u) => !done.has(u.id));
  const withoutLead = await prisma.crmProfile.findMany({
    where: { hubspotContactId: { not: null }, hubspotLeadId: null },
    select: { userId: true },
  });
  const existingLeads = repair
    ? await prisma.crmProfile.findMany({
        where: { hubspotContactId: { not: null } },
        select: { userId: true },
      })
    : [];

  console.log(`${users.length} accounts, ${pending.length} not yet dropped into HubSpot as leads.`);
  console.log(`${withoutLead.length} HubSpot contacts without a HubSpot lead record.`);
  if (repair) {
    console.log(`${existingLeads.length} synced contacts will be re-queued to repair Lead records.`);
  }
  if (!apply) {
    console.log("Dry run. Re-run with --apply to queue them and sync to HubSpot.");
    if (repair) console.log("Include --repair with --apply to refresh existing leads.");
    return;
  }

  for (const user of pending) {
    await ensureLeadRegistered(user.id);
  }
  const queued = new Set<string>();
  for (const { userId } of withoutLead) {
    await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId });
    queued.add(userId);
  }
  for (const { userId } of existingLeads) {
    if (queued.has(userId)) continue;
    await enqueueCrmJob({ kind: CrmJobKind.CONTACT_SYNC, userId });
    queued.add(userId);
  }
  console.log(
    `Queued ${pending.length + queued.size} contact syncs. Syncing to HubSpot...`
  );

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
