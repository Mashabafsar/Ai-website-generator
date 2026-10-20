// Durable queue for HubSpot work.
//
// Request handlers write a row here and return. That is the whole reason the
// integration can't break signup or checkout: the user-facing path only touches
// Postgres, and every HubSpot call happens afterwards in a worker that is free
// to be slow, fail, and retry.

import type { CrmOutbox } from "@prisma/client";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { CrmJobKind, CrmJobStatus } from "@/lib/crm/config";

/** How long a claimed job stays claimed before another worker may retake it. */
const LEASE_MS = 60_000;

function backoffMs(attempts: number): number {
  const base = Math.min(30_000 * 2 ** Math.max(0, attempts - 1), 30 * 60_000);
  const [rand] = crypto.getRandomValues(new Uint32Array(1));
  return base / 2 + (rand / 2 ** 32) * (base / 2);
}

/**
 * Queue a job, coalescing on `dedupeKey`.
 *
 * A job that is still pending is left alone — the worker reads current database
 * state when it runs, so one pending contact sync already covers every change
 * made since it was queued. A job that already completed is reopened, which is
 * how a deal gets its URL upgraded after the site goes live.
 */
export async function enqueueCrmJob(params: {
  kind: CrmJobKind;
  userId?: string | null;
  projectId?: string | null;
  paymentId?: string | null;
  /** Defaults to one job per kind per subject. */
  dedupeKey?: string;
}): Promise<void> {
  const subject = params.paymentId ?? params.projectId ?? params.userId ?? "global";
  const dedupeKey = params.dedupeKey ?? `${params.kind}:${subject}`;

  try {
    await prisma.crmOutbox.upsert({
      where: { dedupeKey },
      create: {
        kind: params.kind,
        dedupeKey,
        userId: params.userId ?? null,
        projectId: params.projectId ?? null,
        paymentId: params.paymentId ?? null,
      },
      update: {
        status: CrmJobStatus.PENDING,
        attempts: 0,
        nextAttemptAt: new Date(),
        lastError: null,
        // Refresh subjects so a credit-pack reopen of a legacy payment-scoped
        // row still carries the account id the worker needs.
        ...(params.userId ? { userId: params.userId } : {}),
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...(params.paymentId ? { paymentId: params.paymentId } : {}),
      },
    });
  } catch (err) {
    // Queueing must never take down the flow that triggered it.
    console.error("[crm] could not queue job:", err instanceof Error ? err.message : err);
  }
}

/** Take ownership of one job, or return null if another worker got there first. */
async function claim(job: CrmOutbox): Promise<CrmOutbox | null> {
  const now = new Date();
  const claimed = await prisma.crmOutbox.updateMany({
    where: { id: job.id, status: job.status, nextAttemptAt: { lte: now } },
    data: {
      status: CrmJobStatus.RUNNING,
      attempts: { increment: 1 },
      nextAttemptAt: new Date(now.getTime() + LEASE_MS),
    },
  });
  if (claimed.count !== 1) return null;
  return prisma.crmOutbox.findUnique({ where: { id: job.id } });
}

/**
 * Jobs ready to run: anything pending whose backoff has elapsed, plus anything
 * left RUNNING by a worker that died before finishing (its lease expired).
 */
async function dueJobs(limit: number): Promise<CrmOutbox[]> {
  return prisma.crmOutbox.findMany({
    where: {
      status: { in: [CrmJobStatus.PENDING, CrmJobStatus.RUNNING] },
      nextAttemptAt: { lte: new Date() },
    },
    orderBy: { nextAttemptAt: "asc" },
    take: limit,
  });
}

/**
 * Finish a claimed job only while it is still RUNNING.
 *
 * `enqueueCrmJob` may reopen the same dedupe key to PENDING while this worker
 * is mid-flight (e.g. go-live deal refresh overlapping a credit-pack purchase).
 * An unconditional DONE would clobber that reopen and drop the newer sync.
 */
async function markDone(id: string): Promise<void> {
  await prisma.crmOutbox.updateMany({
    where: { id, status: CrmJobStatus.RUNNING },
    data: { status: CrmJobStatus.DONE, lastError: null, nextAttemptAt: new Date() },
  });
}

async function recordProfileError(userId: string | null, message: string): Promise<void> {
  if (!userId) return;
  try {
    await prisma.crmProfile.upsert({
      where: { userId },
      create: { userId, hubspotLastError: message.slice(0, 500) },
      update: { hubspotLastError: message.slice(0, 500) },
    });
  } catch (err) {
    console.error(
      "[crm] could not record profile error:",
      err instanceof Error ? err.message : err
    );
  }
}

async function markFailed(job: CrmOutbox, message: string): Promise<void> {
  const exhausted = job.attempts + 1 >= env.hubspot.maxJobAttempts;
  const lastError = message.slice(0, 500);
  // Same race as markDone: only rewrite the row we still own as RUNNING.
  await prisma.crmOutbox.updateMany({
    where: { id: job.id, status: CrmJobStatus.RUNNING },
    data: {
      status: exhausted ? CrmJobStatus.FAILED : CrmJobStatus.PENDING,
      lastError,
      nextAttemptAt: new Date(Date.now() + backoffMs(job.attempts + 1)),
    },
  });
  await recordProfileError(job.userId, lastError);
}

export type CrmJobHandler = (job: CrmOutbox) => Promise<void>;

/**
 * Run every due job. Returns counts for the caller to log.
 *
 * Jobs run one at a time on purpose: HubSpot's burst limit is per app, and a
 * single sequential worker is far easier to keep under it than a fan-out.
 */
export async function drainCrmOutbox(params: {
  handler: CrmJobHandler;
  limit?: number;
}): Promise<{ processed: number; failed: number; skipped: number }> {
  const limit = params.limit ?? 25;
  const jobs = await dueJobs(limit);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  for (const candidate of jobs) {
    const job = await claim(candidate);
    if (!job) {
      skipped += 1;
      continue;
    }

    try {
      await params.handler(job);
      await markDone(job.id);
      processed += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await markFailed(job, message);
      failed += 1;
      console.error(`[crm] job ${job.kind} (${job.dedupeKey}) failed: ${message}`);
    }
  }

  return { processed, failed, skipped };
}

export { CrmJobKind };
