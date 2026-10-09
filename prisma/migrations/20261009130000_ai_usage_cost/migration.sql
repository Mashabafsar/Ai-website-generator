-- Per-call estimated USD cost + project lookup for the admin usage ledger.
ALTER TABLE "AiUsage" ADD COLUMN IF NOT EXISTS "costUsdCents" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "AiUsage_projectId_idx" ON "AiUsage"("projectId");
