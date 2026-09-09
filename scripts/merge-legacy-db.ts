/**
 * One-off: merge the older "website builder templates" SQLite dump into the
 * current Supabase database, on top of an already-imported prisma/dev.db.
 *
 *   node scripts/export-sqlite-dump.mjs "<legacy>/prisma/dev.db" tmp/legacy-export.json
 *   node --env-file=.env --import tsx scripts/merge-legacy-db.ts [--apply]
 *
 * Runs as a dry run unless --apply is passed.
 *
 * The two datasets overlap on one email. Because `email`, `CreditWallet.userId`
 * and `Project.userId` are all unique, a colliding account cannot simply be
 * inserted again: its rows are re-pointed at the account that already exists,
 * its wallet balance is added to the live one, and its project is reported as
 * unmergeable rather than silently dropped (a user may hold only one project).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

type Row = Record<string, unknown>;
type Dump = Record<string, Row[]>;

const DUMP_PATH = path.join(process.cwd(), "tmp", "legacy-export.json");
const APPLY = process.argv.includes("--apply");

function asDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

const str = (v: unknown) => (v == null ? null : String(v));

async function main() {
  const dump = JSON.parse(await readFile(DUMP_PATH, "utf8")) as Dump;
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL or DIRECT_URL is required.");

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const liveUsers = await prisma.user.findMany({ select: { id: true, email: true } });
    const emailToLiveId = new Map(liveUsers.map((u) => [u.email.toLowerCase(), u.id]));
    const usersWithProject = new Set(
      (await prisma.project.findMany({ select: { userId: true } })).map((p) => p.userId)
    );

    const templates = await prisma.template.findMany({ select: { id: true, slug: true } });
    const slugToId = new Map(templates.map((t) => [t.slug, t.id]));
    const oldTemplateSlug = new Map(
      (dump.Template ?? []).map((t) => [String(t.id), String(t.slug)])
    );

    // oldUserId -> id to write. Existing accounts keep their live id.
    const userIdMap = new Map<string, string>();
    const merged: { email: string; liveId: string }[] = [];
    const freshUsers: Row[] = [];

    for (const u of dump.user ?? []) {
      const oldId = String(u.id);
      const liveId = emailToLiveId.get(String(u.email).toLowerCase());
      if (liveId) {
        userIdMap.set(oldId, liveId);
        merged.push({ email: String(u.email), liveId });
      } else {
        userIdMap.set(oldId, oldId);
        freshUsers.push(u);
      }
    }
    const isMerged = (oldId: string) => userIdMap.get(oldId) !== oldId;

    // Projects: one per user, so anyone who already owns one must be skipped.
    const projectRows: Row[] = [];
    const blockedProjects: string[] = [];
    for (const p of dump.Project ?? []) {
      const owner = userIdMap.get(String(p.userId));
      if (!owner) continue;
      if (usersWithProject.has(owner)) {
        blockedProjects.push(`${String(p.businessName)} (owner already has a project)`);
        continue;
      }
      usersWithProject.add(owner);
      const slug = p.templateId ? oldTemplateSlug.get(String(p.templateId)) : null;
      projectRows.push({
        ...p,
        userId: owner,
        templateId: slug ? slugToId.get(slug) ?? null : null,
      });
    }
    const importedProjectIds = new Set(projectRows.map((p) => String(p.id)));

    const walletTopUps: { userId: string; add: number }[] = [];
    const walletRows: Row[] = [];
    for (const w of dump.CreditWallet ?? []) {
      const owner = userIdMap.get(String(w.userId));
      if (!owner) continue;
      if (isMerged(String(w.userId))) {
        walletTopUps.push({ userId: owner, add: Number(w.balance ?? 0) });
      } else {
        walletRows.push({ ...w, userId: owner });
      }
    }

    const ledgerRows: Row[] = (dump.CreditLedger ?? [])
      .filter((l) => userIdMap.has(String(l.userId)))
      .map((l) => ({ ...l, userId: userIdMap.get(String(l.userId))! }));

    // Credential rows for an existing account would give Better Auth a second
    // password for the same user, so only fresh accounts get theirs.
    const accountRows = (dump.account ?? []).filter((a) => !isMerged(String(a.userId)));
    const sessionRows = (dump.session ?? []).filter((s) => !isMerged(String(s.userId)));

    const childOf = (rows: Row[] | undefined) =>
      (rows ?? []).filter((r) => importedProjectIds.has(String(r.projectId)));
    const questionnaireRows = childOf(dump.Questionnaire);
    const quoteRows = childOf(dump.Quote);
    const paymentRows = childOf(dump.Payment);
    const deploymentRows = childOf(dump.Deployment);

    console.log(`mode: ${APPLY ? "APPLY" : "DRY RUN (pass --apply to write)"}\n`);
    console.log("new users            ", freshUsers.length);
    console.log("merged into existing ", merged.map((m) => m.email).join(", ") || "(none)");
    console.log("accounts             ", accountRows.length);
    console.log("sessions             ", sessionRows.length);
    console.log("wallets (new)        ", walletRows.length);
    console.log("wallet top-ups       ", walletTopUps.map((t) => `+${t.add}`).join(", ") || "(none)");
    console.log("ledger               ", ledgerRows.length);
    console.log("projects             ", projectRows.length);
    console.log("questionnaires       ", questionnaireRows.length);
    console.log("quotes               ", quoteRows.length);
    console.log("payments             ", paymentRows.length);
    console.log("deployments          ", deploymentRows.length);
    if (blockedProjects.length) {
      console.log("\nNOT merged (needs a decision):");
      for (const b of blockedProjects) console.log("  -", b);
    }

    if (!APPLY) {
      console.log("\nDry run only — nothing written.");
      return;
    }

    console.log("\nWriting…");

    if (freshUsers.length) {
      await prisma.user.createMany({
        data: freshUsers.map((r) => ({
          id: String(r.id),
          name: String(r.name ?? ""),
          email: String(r.email),
          emailVerified: Boolean(r.emailVerified),
          image: str(r.image),
          isAdmin: Boolean(r.isAdmin),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (accountRows.length) {
      await prisma.account.createMany({
        data: accountRows.map((r) => ({
          id: String(r.id),
          accountId: String(r.accountId),
          providerId: String(r.providerId),
          userId: userIdMap.get(String(r.userId))!,
          accessToken: str(r.accessToken),
          refreshToken: str(r.refreshToken),
          idToken: str(r.idToken),
          accessTokenExpiresAt: asDate(r.accessTokenExpiresAt),
          refreshTokenExpiresAt: asDate(r.refreshTokenExpiresAt),
          scope: str(r.scope),
          password: str(r.password),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (sessionRows.length) {
      await prisma.session.createMany({
        data: sessionRows.map((r) => ({
          id: String(r.id),
          expiresAt: asDate(r.expiresAt) ?? new Date(),
          token: String(r.token),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
          ipAddress: str(r.ipAddress),
          userAgent: str(r.userAgent),
          userId: userIdMap.get(String(r.userId))!,
        })),
        skipDuplicates: true,
      });
    }

    if (walletRows.length) {
      await prisma.creditWallet.createMany({
        data: walletRows.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          balance: Number(r.balance ?? 0),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    for (const topUp of walletTopUps) {
      const updated = await prisma.creditWallet.update({
        where: { userId: topUp.userId },
        data: { balance: { increment: topUp.add } },
        select: { balance: true },
      });
      console.log(`  wallet ${topUp.userId} +${topUp.add} -> ${updated.balance}`);
    }

    if (projectRows.length) {
      await prisma.project.createMany({
        data: projectRows.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          businessName: String(r.businessName),
          slug: String(r.slug),
          status: String(r.status ?? "DRAFT"),
          templateId: str(r.templateId),
          designVersion: Number(r.designVersion ?? 1),
          blueprint: str(r.blueprint),
          assembledPages: str(r.assembledPages),
          theme: str(r.theme),
          generationDegraded: Boolean(r.generationDegraded),
          githubRepoUrl: str(r.githubRepoUrl),
          githubCommitSha: str(r.githubCommitSha),
          githubSyncStatus: String(r.githubSyncStatus ?? "PENDING"),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (ledgerRows.length) {
      await prisma.creditLedger.createMany({
        data: ledgerRows.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          amount: Number(r.amount),
          balanceAfter: Number(r.balanceAfter),
          reason: String(r.reason),
          projectId: str(r.projectId),
          stripePaymentId: str(r.stripePaymentId),
          idempotencyKey: String(r.idempotencyKey),
          createdAt: asDate(r.createdAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (questionnaireRows.length) {
      await prisma.questionnaire.createMany({
        data: questionnaireRows.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          answers: String(r.answers ?? "{}"),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (quoteRows.length) {
      await prisma.quote.createMany({
        data: quoteRows.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          packageType: String(r.packageType),
          oneTimeTotal: Number(r.oneTimeTotal),
          monthlyTotal: Number(r.monthlyTotal ?? 0),
          currency: String(r.currency ?? "USD"),
          lineItems: String(r.lineItems ?? "[]"),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (paymentRows.length) {
      await prisma.payment.createMany({
        data: paymentRows.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          type: String(r.type),
          packageType: str(r.packageType),
          status: String(r.status ?? "PENDING"),
          amount: Number(r.amount ?? 0),
          currency: String(r.currency ?? "USD"),
          stripeSessionId: str(r.stripeSessionId),
          stripePaymentIntentId: str(r.stripePaymentIntentId),
          stripeSubscriptionId: str(r.stripeSubscriptionId),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (deploymentRows.length) {
      await prisma.deployment.createMany({
        data: deploymentRows.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          status: String(r.status ?? "PENDING"),
          subdomain: str(r.subdomain),
          liveUrl: str(r.liveUrl),
          provider: String(r.provider ?? "vercel"),
          logs: str(r.logs),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("\nCounts after merge:", {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      wallets: await prisma.creditWallet.count(),
      ledger: await prisma.creditLedger.count(),
      projects: await prisma.project.count(),
      questionnaires: await prisma.questionnaire.count(),
      quotes: await prisma.quote.count(),
      payments: await prisma.payment.count(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
