-- PostgREST exposes every table in `public`. This app only talks to Postgres
-- through Prisma (table owner), so enable RLS with no policies: Data API roles
-- get zero rows, while Prisma keeps working because the owner bypasses RLS.

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AiIncident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AiUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CreditLedger" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CreditWallet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Deployment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Questionnaire" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."account" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."AiIncident" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."AiUsage" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."CreditLedger" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."CreditWallet" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Deployment" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Payment" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Project" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Questionnaire" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Quote" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."session" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."Template" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."user" FROM anon, authenticated, PUBLIC;
REVOKE ALL ON TABLE public."verification" FROM anon, authenticated, PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated, PUBLIC;
