/**
 * One-off: copy prisma/dev.db into the current Prisma Postgres (Supabase)
 * and upload public/uploads into the scraped-assets bucket.
 *
 *   node --env-file=.env --import tsx scripts/migrate-sqlite-to-supabase.ts
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;
type Dump = Record<string, Row[]>;

const ROOT = process.cwd();
const DUMP_PATH = path.join(ROOT, "tmp", "sqlite-export.json");
const UPLOADS_DIR = path.join(ROOT, "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function asDate(value: unknown): Date | null {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function rewriteUploadUrls(text: string | null | undefined, publicBase: string): string | null {
  if (!text) return text ?? null;
  return text
    .replace(/https?:\/\/localhost:\d+\/uploads\//g, `${publicBase}/`)
    .replace(/\/uploads\//g, `${publicBase}/`);
}

async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkFiles(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

async function main() {
  const dump = JSON.parse(await readFile(DUMP_PATH, "utf8")) as Dump;
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL or DIRECT_URL is required.");

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "scraped-assets";
  const publicBase = supabaseUrl
    ? `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}`
    : "";

  const supabase =
    supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  try {
    const templates = await prisma.template.findMany({ select: { id: true, slug: true } });
    const slugToId = new Map(templates.map((t) => [t.slug, t.id]));
    const oldIdToSlug = new Map(
      (dump.Template ?? []).map((t) => [String(t.id), String(t.slug)])
    );

    const users = dump.user ?? [];
    const sessions = dump.session ?? [];
    const accounts = dump.account ?? [];
    const verifications = dump.verification ?? [];
    const wallets = dump.CreditWallet ?? [];
    const ledger = dump.CreditLedger ?? [];
    const usage = dump.AiUsage ?? [];
    const projects: Row[] = (dump.Project ?? []).map((p) => {
      const oldTemplateId = p.templateId ? String(p.templateId) : null;
      const slug = oldTemplateId ? oldIdToSlug.get(oldTemplateId) : null;
      const templateId = slug ? slugToId.get(slug) ?? oldTemplateId : oldTemplateId;
      return {
        ...p,
        templateId,
        generationDegraded: Boolean(p.generationDegraded),
        blueprint: rewriteUploadUrls(p.blueprint as string | null, publicBase),
        assembledPages: rewriteUploadUrls(p.assembledPages as string | null, publicBase),
        theme: rewriteUploadUrls(p.theme as string | null, publicBase),
      };
    });
    const questionnaires: Row[] = (dump.Questionnaire ?? []).map((q) => ({
      ...q,
      answers: rewriteUploadUrls(q.answers as string | null, publicBase),
    }));
    const quotes = dump.Quote ?? [];
    const payments = dump.Payment ?? [];
    const deployments = dump.Deployment ?? [];

    const toUser = (r: Row) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      emailVerified: Boolean(r.emailVerified),
      image: (r.image as string | null) ?? null,
      isAdmin: Boolean(r.isAdmin),
      createdAt: asDate(r.createdAt) ?? new Date(),
      updatedAt: asDate(r.updatedAt) ?? new Date(),
    });

    console.log("Inserting users…", users.length);
    if (users.length) await prisma.user.createMany({ data: users.map(toUser), skipDuplicates: true });

    console.log("Inserting sessions…", sessions.length);
    if (sessions.length) {
      await prisma.session.createMany({
        data: sessions.map((r) => ({
          id: String(r.id),
          expiresAt: asDate(r.expiresAt) ?? new Date(),
          token: String(r.token),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
          ipAddress: (r.ipAddress as string | null) ?? null,
          userAgent: (r.userAgent as string | null) ?? null,
          userId: String(r.userId),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting accounts…", accounts.length);
    if (accounts.length) {
      await prisma.account.createMany({
        data: accounts.map((r) => ({
          id: String(r.id),
          accountId: String(r.accountId),
          providerId: String(r.providerId),
          userId: String(r.userId),
          accessToken: (r.accessToken as string | null) ?? null,
          refreshToken: (r.refreshToken as string | null) ?? null,
          idToken: (r.idToken as string | null) ?? null,
          accessTokenExpiresAt: asDate(r.accessTokenExpiresAt),
          refreshTokenExpiresAt: asDate(r.refreshTokenExpiresAt),
          scope: (r.scope as string | null) ?? null,
          password: (r.password as string | null) ?? null,
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (verifications.length) {
      await prisma.verification.createMany({
        data: verifications.map((r) => ({
          id: String(r.id),
          identifier: String(r.identifier),
          value: String(r.value),
          expiresAt: asDate(r.expiresAt) ?? new Date(),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting credit wallets…", wallets.length);
    if (wallets.length) {
      await prisma.creditWallet.createMany({
        data: wallets.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          balance: Number(r.balance ?? 0),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting credit ledger…", ledger.length);
    if (ledger.length) {
      await prisma.creditLedger.createMany({
        data: ledger.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          amount: Number(r.amount),
          balanceAfter: Number(r.balanceAfter),
          reason: String(r.reason),
          projectId: (r.projectId as string | null) ?? null,
          stripePaymentId: (r.stripePaymentId as string | null) ?? null,
          idempotencyKey: String(r.idempotencyKey),
          createdAt: asDate(r.createdAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting AI usage…", usage.length);
    if (usage.length) {
      await prisma.aiUsage.createMany({
        data: usage.map((r) => ({
          id: String(r.id),
          createdAt: asDate(r.createdAt) ?? new Date(),
          userId: (r.userId as string | null) ?? null,
          projectId: (r.projectId as string | null) ?? null,
          operation: String(r.operation),
          provider: String(r.provider),
          model: String(r.model),
          promptTokens: Number(r.promptTokens ?? 0),
          completionTokens: Number(r.completionTokens ?? 0),
          totalTokens: Number(r.totalTokens ?? 0),
          estimated: Boolean(r.estimated),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting projects…", projects.length);
    if (projects.length) {
      await prisma.project.createMany({
        data: projects.map((r) => ({
          id: String(r.id),
          userId: String(r.userId),
          businessName: String(r.businessName),
          slug: String(r.slug),
          status: String(r.status ?? "DRAFT"),
          templateId: (r.templateId as string | null) ?? null,
          designVersion: Number(r.designVersion ?? 1),
          blueprint: (r.blueprint as string | null) ?? null,
          assembledPages: (r.assembledPages as string | null) ?? null,
          theme: (r.theme as string | null) ?? null,
          generationDegraded: Boolean(r.generationDegraded),
          githubRepoUrl: (r.githubRepoUrl as string | null) ?? null,
          githubCommitSha: (r.githubCommitSha as string | null) ?? null,
          githubSyncStatus: String(r.githubSyncStatus ?? "PENDING"),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    console.log("Inserting questionnaires…", questionnaires.length);
    if (questionnaires.length) {
      await prisma.questionnaire.createMany({
        data: questionnaires.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          answers: String(r.answers ?? "{}"),
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (quotes.length) {
      await prisma.quote.createMany({
        data: quotes.map((r) => ({
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

    console.log("Inserting payments…", payments.length);
    if (payments.length) {
      await prisma.payment.createMany({
        data: payments.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          type: String(r.type),
          packageType: (r.packageType as string | null) ?? null,
          status: String(r.status ?? "PENDING"),
          amount: Number(r.amount ?? 0),
          currency: String(r.currency ?? "USD"),
          stripeSessionId: (r.stripeSessionId as string | null) ?? null,
          stripePaymentIntentId: (r.stripePaymentIntentId as string | null) ?? null,
          stripeSubscriptionId: (r.stripeSubscriptionId as string | null) ?? null,
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (deployments.length) {
      await prisma.deployment.createMany({
        data: deployments.map((r) => ({
          id: String(r.id),
          projectId: String(r.projectId),
          status: String(r.status ?? "PENDING"),
          subdomain: (r.subdomain as string | null) ?? null,
          liveUrl: (r.liveUrl as string | null) ?? null,
          provider: String(r.provider ?? "vercel"),
          logs: (r.logs as string | null) ?? null,
          createdAt: asDate(r.createdAt) ?? new Date(),
          updatedAt: asDate(r.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    const counts = {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      wallets: await prisma.creditWallet.count(),
      ledger: await prisma.creditLedger.count(),
      usage: await prisma.aiUsage.count(),
      projects: await prisma.project.count(),
      questionnaires: await prisma.questionnaire.count(),
      payments: await prisma.payment.count(),
      templates: await prisma.template.count(),
    };
    console.log("Postgres counts after import:", counts);
  } finally {
    await prisma.$disconnect();
  }

  if (!supabase) {
    console.log("Skipping image upload: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.");
    return;
  }

  const files = await walkFiles(UPLOADS_DIR);
  console.log("Uploading images…", files.length);
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const file of files) {
    const rel = path.relative(UPLOADS_DIR, file).replaceAll("\\", "/");
    const ext = path.extname(file).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    const info = await stat(file);
    if (!info.size) {
      skipped += 1;
      continue;
    }
    const bytes = await readFile(file);
    const { error } = await supabase.storage.from(bucket).upload(rel, bytes, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) {
      failed += 1;
      console.error(`  fail ${rel}: ${error.message}`);
    } else {
      uploaded += 1;
    }
  }
  console.log(`Images uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
