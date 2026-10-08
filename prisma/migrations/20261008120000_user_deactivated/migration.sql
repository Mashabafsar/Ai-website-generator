-- Account deactivation for stale unpaid accounts (no website / credit purchase).
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deactivatedReason" TEXT;

CREATE INDEX IF NOT EXISTS "user_deactivatedAt_createdAt_idx" ON "user"("deactivatedAt", "createdAt");
