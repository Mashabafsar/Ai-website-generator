-- Lead scoring, marketing consent, HubSpot outbox, and the Payment snapshot
-- columns the checkout/fulfillment paths already write.

ALTER TABLE "Payment" ADD COLUMN "breakdown" TEXT;
ALTER TABLE "Payment" ADD COLUMN "amountCents" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "hubspotDealId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "hubspotNoteId" TEXT;

CREATE TABLE "CrmProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "lastAction" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "marketingConsentAt" TIMESTAMP(3),
    "hubspotContactId" TEXT,
    "hubspotLastSyncedAt" TIMESTAMP(3),
    "hubspotLastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmScoreEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmScoreEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrmOutbox" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "paymentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmOutbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CrmProfile_userId_key" ON "CrmProfile"("userId");
CREATE INDEX "CrmProfile_leadScore_idx" ON "CrmProfile"("leadScore");
CREATE UNIQUE INDEX "CrmScoreEvent_idempotencyKey_key" ON "CrmScoreEvent"("idempotencyKey");
CREATE INDEX "CrmScoreEvent_userId_createdAt_idx" ON "CrmScoreEvent"("userId", "createdAt");
CREATE UNIQUE INDEX "CrmOutbox_dedupeKey_key" ON "CrmOutbox"("dedupeKey");
CREATE INDEX "CrmOutbox_status_nextAttemptAt_idx" ON "CrmOutbox"("status", "nextAttemptAt");
CREATE INDEX "CrmOutbox_userId_idx" ON "CrmOutbox"("userId");

ALTER TABLE "CrmProfile" ADD CONSTRAINT "CrmProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmScoreEvent" ADD CONSTRAINT "CrmScoreEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrmOutbox" ADD CONSTRAINT "CrmOutbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostgREST exposes every public table. Prisma owns these; Data API roles get zero rows.
ALTER TABLE public."CrmProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CrmScoreEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CrmOutbox" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."CrmProfile" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."CrmScoreEvent" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."CrmOutbox" FROM anon, authenticated, PUBLIC;
