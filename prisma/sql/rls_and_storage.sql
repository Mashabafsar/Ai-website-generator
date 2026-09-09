-- Supabase hardening for this Prisma-owned backend.
-- Apply after Prisma has created tables.
--
-- Notes:
-- 1) This app talks to Postgres through Prisma on the server only.
-- 2) We intentionally do not grant anon/authenticated access to app tables.
-- 3) Better Auth is used (not Supabase Auth), so auth.uid() policies are not used here.
-- 4) Turn off the Data API in Supabase Dashboard when Prisma is your only DB client.

begin;

-- App tables: enable RLS as defense-in-depth, then revoke browser roles.
alter table if exists public."user" enable row level security;
alter table if exists public."session" enable row level security;
alter table if exists public."account" enable row level security;
alter table if exists public."verification" enable row level security;
alter table if exists public."Project" enable row level security;
alter table if exists public."Template" enable row level security;
alter table if exists public."Questionnaire" enable row level security;
alter table if exists public."Quote" enable row level security;
alter table if exists public."Payment" enable row level security;
alter table if exists public."Deployment" enable row level security;
alter table if exists public."CreditWallet" enable row level security;
alter table if exists public."CreditLedger" enable row level security;
alter table if exists public."AiUsage" enable row level security;
alter table if exists public."AiIncident" enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke usage on schema public from anon, authenticated;

-- Storage bucket for scraped + uploaded website assets.
insert into storage.buckets (id, name, public)
values ('scraped-assets', 'scraped-assets', true)
on conflict (id) do update
set public = excluded.public,
    name = excluded.name;

commit;
