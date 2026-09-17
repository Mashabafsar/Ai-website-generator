# Agency Partner Interactive — AI Website Builder

A self-service platform that turns a short business questionnaire into a finished website: preview it, edit it, get an automated quote, pay with Stripe, then download a ZIP or go live on a subdomain.

This README is the working picture of the project: **what it was built to do**, **what is already in place**, and **what still has to be achieved**.

---

## What this project set out to do

The original goal was an automated website studio for agencies and businesses — not a chatbot that dumps HTML.

A user signs up, describes their business, and receives a professional site. The first generation uses a **heavy AI model API** for planning, copy, SEO, and structured output. Later edits use a **lightweight model API** so small rewrites stay cheap. There is **no local AI**. Models never write unrestricted frontend code. They produce a `WebsiteBlueprint` JSON; the app maps that onto approved ShadCN / Tailwind / Next.js sections.

The rest of the product was meant to run without a human in the loop:

| Area | Original intent |
|---|---|
| Images | Licensed stock, in order: Shutterstock → Pexels → Unsplash, then a placeholder |
| Pricing | A deterministic quote engine — never an AI guess |
| Payment | Stripe: one-time ZIP (self-hosting) or creation fee + monthly (managed hosting) |
| Credits | Credits gate AI work; Stripe package payment gates delivery |
| Backup | Paid websites committed to the **AI-WEBSITE-BUILDER-WEBSITE** GitHub repo under `clients/<slug>/` |
| Delivery | ZIP download, or automatic deploy to `{slug}.{PLATFORM_DOMAIN}` |
| CRM | After a website-package payment, upsert the paying customer in HubSpot |
| Notify | Email the owner when the ZIP is ready or the site goes live |
| Database | Prisma as the only data layer (originally SQLite, now Supabase Postgres) |

The architecture is a set of named agents (orchestrator, planner, validator, assembler, quote, payment, GitHub, deploy, export, QA, security). They can stay as server functions; the names exist so responsibilities stay clean. Full agent contracts live in `AGENTS.md`. System design lives in `architecture.md`. Template authoring lives in `TEMPLATES.md`.

---

## What is currently in place

The core product loop works end to end in this repo.

### Product flow

1. **Auth** — Better Auth email signup/login. New accounts receive a starter credit bonus.
2. **Template library** — Users pick a complete, locked design (bespoke renderers such as ForgeTech, Techvantage, CraftedSpaces, plus standard-section designs). The AI fills content slots; it cannot invent layout.
3. **Questionnaire** — Structured answers (business, audience, services, tone, style, pages, package). Optional **existing-website import** scrapes brand assets (logo, colors, images) with consent tracking.
4. **Generate** — Heavy Cursor model, then a deterministic template fallback. Output is Zod-validated, sanitized, and forced onto the chosen template's slots.
5. **Preview & editor** — Live preview (desktop / tablet / mobile), manual edits (text, images, theme, fonts, icons), and optional lightweight AI section rewrites.
6. **Credits** — Wallet + ledger with atomic spend, refund on failed generation, and Stripe credit packs. Admin usage page records real token metering separately from credit prices.
7. **Quote & pay** — Deterministic quote page; Stripe Checkout for website packages and credit packs; webhook + reconcile path.
8. **Deliver** — ZIP export for self-hosting; after website-package payment, the static site is committed into **AI-WEBSITE-BUILDER-WEBSITE** at `clients/<slug>/`; Vercel deploy + subdomain assignment for managed hosting; HubSpot and Resend hooks when configured.

### Platform work already done

- **Supabase Postgres** replaced SQLite. Prisma uses `DATABASE_URL` (pooler) and `DIRECT_URL` (migrations). The Prisma client appends `pgbouncer=true` on port `6543` so prepared-statement errors do not appear on the transaction pooler.
- **Supabase Storage** (`scraped-assets`) holds scraped and uploaded images. RLS is applied as defense-in-depth; the app talks to Postgres only through Prisma.
- **Historical data** from the old SQLite databases (`prisma/dev.db` and the earlier templates-folder copy) has been imported: accounts, passwords, projects, questionnaires, quotes, payments, credit wallets/ledgers, and AI usage. Images from `public/uploads` were uploaded to the storage bucket.
- **15 published templates** are seeded in the new database (10 from the original library plus later designs such as ForgeLime, Mainfile, SaaS LDG, Sports, and Whiter).

### Stack

Next.js 15 (App Router), TypeScript, Tailwind, ShadCN, Prisma + Supabase Postgres, Better Auth, Stripe, Cursor API.

Agents live as functions under `lib/agents/`. AI providers, blueprint schemas, the section registry, credits, quote, Stripe, GitHub, deploy, and ZIP export sit beside them under `lib/`.

---

## Goals still to achieve

These are the remaining product and production goals — not a dump of every possible improvement.

### Make delivery production-ready

- Run GitHub backup, Vercel subdomain deploys, HubSpot customer sync, and owner emails against **live keys**, not just local stubs.
- Confirm Stripe webhooks, website-package checkout, and credit-pack checkout in a real Stripe environment (test, then live).
- Prove the ZIP and live-site paths on paid projects: self-hosting download, managed hosting going live on `{slug}.{PLATFORM_DOMAIN}`.

### Finish the generation quality bar

- Keep the heavy Cursor model as the default first generation; keep the template fallback **unbilled** when the model fails.
- Tighten QA so empty sections, missing CTAs, broken images, and weak SEO do not ship to preview.
- Grow the template library with more locked, industry-ready designs without letting the AI invent unsupported sections.

### Operate it as a real service

- One-project-per-user is still the product rule. If agencies need several sites, that is a deliberate schema and UX change — not a silent exception.
- Replace the in-memory rate limiter with a shared store before running more than one app instance.
- Clean leftover test accounts and expired sessions from the migrated database when they are no longer useful.
- Keep `.env` under Stripe Projects CLI (`stripe projects env --pull`). Do not hand-edit CLI-managed files.

### Guardrails that must never regress

- AI output stays untrusted: validate, sanitize, render only approved section variants.
- Credits stay transactional (no negative balances, no double-charges, refunds on failed generations).
- Payment gates **delivery only**. Projects and previews exist before anyone pays. GitHub (the shared sites repo) and live hosting wait until the website package is paid.
- Never deploy an unpaid managed-hosting site. Never expose server secrets in generated files.

---

## How it works (short)

```
Sign up → pick a template → questionnaire (+ optional brand import)
    → heavy-model blueprint → validate → assemble ShadCN sections → stock images
    → preview / editor / light AI rewrites
    → quote → Stripe
    → ZIP  and/or  paid site committed to AI-WEBSITE-BUILDER-WEBSITE  and/or  subdomain deploy
```

Credits gate AI. Stripe package payment gates ZIP, the shared GitHub sites repo, and live hosting.

---

## Setup

```bash
npm install
cp .env.example .env       # then fill values (see below)
npm run db:push            # create/update the Postgres schema
npm run dev                # http://localhost:3000
```

The app runs without external keys: AI falls back to a deterministic template blueprint, images fall back to placeholders, and payments / GitHub / deploy degrade gracefully.

### Environment variables

See `.env.example` for the full list. Highlights:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres runtime URL (pooler, `:6543`; `pgbouncer=true` is applied in code if missing) |
| `DIRECT_URL` | Supabase Postgres direct URL for Prisma migrations (`:5432`) |
| `BETTER_AUTH_SECRET` | Auth session signing secret |
| `CURSOR_API_KEY` | Cursor SDK key (the only AI provider) |
| `HEAVY_MODEL_NAME` / `LIGHT_MODEL_NAME` | Cursor models for generation vs. edits |
| `CURSOR_TIMEOUT_MS` | How long to wait on Cursor for a full website (default 15 minutes) before template fallback |
| `CURSOR_LIGHT_TIMEOUT_MS` | How long to wait for site plan, import extract, and section edits (default 10 minutes) |
| `AI_USE_MOCK` | `true` to skip APIs and use the local template |
| `SIGNUP_CREDIT_BONUS`, `CREDIT_COST_HEAVY_GENERATE`, `CREDIT_COST_LIGHT_EDIT` | Credit economics |
| `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY` | Stock image providers |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs | Payments |
| `HUBSPOT_ACCESS_TOKEN` | Upsert paying customers as HubSpot contacts |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | Email when a site goes live or the ZIP is ready |
| `GITHUB_TOKEN`, `GITHUB_ORG` | Token needs **write** on **AI-WEBSITE-BUILDER-WEBSITE**. Org is the repo owner when `GITHUB_SITES_REPO` is unset |
| `GITHUB_SITES_REPO` | Optional `owner/AI-WEBSITE-BUILDER-WEBSITE` override |
| `GITHUB_REPO_VISIBILITY` | Unused for the shared sites repo (that repo already exists) |
| `DEPLOYMENT_TOKEN`, `PLATFORM_DOMAIN` | Managed subdomain deploys (Vercel) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Storage uploads for scraped/editor images |
| `SUPABASE_STORAGE_BUCKET` | Bucket name (default `scraped-assets`) |

### Local Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

### Paid sites repo

Create the GitHub repository **AI-WEBSITE-BUILDER-WEBSITE** (already done in this setup). Grant `GITHUB_TOKEN` write access. Set `GITHUB_ORG` to the owner, or set `GITHUB_SITES_REPO` to `owner/AI-WEBSITE-BUILDER-WEBSITE`.

After a website-package payment succeeds (Stripe webhook or checkout reconcile), the generated static files are committed to `clients/<business-slug>-<id>/` on `main`. Later editor saves and regenerations update that folder only while the project is paid. Unpaid drafts stay in this app’s database.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Start the production server |
| `npm run db:push` | Sync the Prisma schema to Postgres |
| `npm run db:studio` | Open Prisma Studio |
| `npm run validate` | Template, icon, and lock checks |

---

## Notes

- Generated client sites are a static HTML bundle (Tailwind via CDN), so they deploy to any static host with no build step.
- The generated client must never contain server secrets.
- Further reading: `AGENTS.md` (agent contracts), `architecture.md` (system design), `TEMPLATES.md` (how to add a design).
