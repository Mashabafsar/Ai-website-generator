# Agency Partner Interactive — AI Website Builder

Generate a complete business website from a short questionnaire, preview and edit it, get an automated quote, pay with Stripe, and either download the source as a ZIP or deploy it live on a subdomain. Built with Next.js (App Router), TypeScript, Tailwind, ShadCN, Prisma + Supabase Postgres, and Better Auth.

## How it works

1. **Sign up** — every account gets a one-time starter credit bonus.
2. **Questionnaire** — describe the business, audience, services, tone, style, pages, and package.
3. **Generate** — the AI produces a structured `WebsiteBlueprint` (JSON only). The app maps it onto approved ShadCN sections — the model never writes raw frontend code.
4. **Preview & edit** — a live preview with a manual editor (text, reorder, add/remove sections, theme). Optional lightweight AI rewrites per section.
5. **Persist & back up** — the project is always saved to Supabase Postgres and pushed to a private GitHub repo, regardless of payment.
6. **Quote & pay** — a deterministic quote engine prices the site; Stripe Checkout handles website packages and credit packs.
7. **Deliver** — self-hosting unlocks a ZIP download; managed hosting deploys to `{slug}.{PLATFORM_DOMAIN}`.

Credits gate AI work (generation, section rewrites). Delivery (ZIP / live deploy) is gated by the Stripe package payment — never the existence of the project.

## Prerequisites

- Node.js 18.18+ (or 20+)
- npm

## Setup

```bash
npm install
cp .env.example .env       # then edit values (see below)
npm run db:push            # create/update the Postgres schema
npm run dev                # http://localhost:3000
```

The app runs out of the box with no external keys: AI falls back to a deterministic template blueprint, images fall back to placeholders, and payments/GitHub/deploy degrade gracefully.

## Environment variables

See `.env.example` for the full list. Highlights:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres runtime URL (pooler transaction mode, `:6543`, usually with `pgbouncer=true`) |
| `DIRECT_URL` | Supabase Postgres direct/session URL for Prisma migrations (`:5432`) |
| `BETTER_AUTH_SECRET` | Auth session signing secret |
| `CURSOR_API_KEY` | Cursor SDK key (primary AI) |
| `HEAVY_MODEL_NAME` / `LIGHT_MODEL_NAME` | Cursor models for generation vs. edits |
| `GEMINI_API_KEY` / `GEMINI_MODEL_NAME` | Gemini fallback when Cursor fails |
| `AI_USE_MOCK` | `true` to skip APIs and use the local template |
| `SIGNUP_CREDIT_BONUS`, `CREDIT_COST_HEAVY_GENERATE`, `CREDIT_COST_LIGHT_EDIT` | Credit economics |
| `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY` | Stock image providers (fallback chain) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs | Payments |
| `HUBSPOT_ACCESS_TOKEN` | Optional. Upsert paying customers as HubSpot contacts |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | Optional. Email the account owner when a site goes live or the ZIP is ready |
| `GITHUB_TOKEN`, `GITHUB_ORG`, `GITHUB_REPO_VISIBILITY` | GitHub backup |
| `DEPLOYMENT_TOKEN`, `PLATFORM_DOMAIN` | Managed subdomain deploys (Vercel) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase Storage uploads for scraped/editor images |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name for uploaded assets (default `scraped-assets`) |

### Supabase setup notes

- **Prisma + Postgres:** keep Prisma as the ORM; set both `DATABASE_URL` and `DIRECT_URL`.
- **Migrations:** run `prisma migrate deploy` in deploy pipelines using `DIRECT_URL`.
- **Storage bucket:** create `scraped-assets` as a **public** bucket so generated image URLs work directly in `<img>` tags.
- **Storage CORS:** in Supabase Storage settings, allow at least `GET`, `HEAD`, `OPTIONS` from your app domain (or `*` for simpler setup).
- **Data API hardening:** if Prisma is your only database client, disable Supabase Data API and apply `prisma/sql/rls_and_storage.sql`.

### Stripe webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`. Without a secret, the webhook accepts unverified events only in development.

## Architecture

Agents are plain server functions in `lib/agents/*`, coordinated by the Orchestrator. The pipeline is **validate → assemble → render**: AI JSON is never rendered until it passes Zod validation and sanitization.

```
lib/
  agents/       orchestrator, requirement-analyst, theme, image-sourcing,
                section-assembly, security, qa, editor
  ai/           Cursor provider + prompt builder (swappable interface)
  blueprint/    Zod schemas + types for WebsiteBlueprint
  sections/     section registry (single source of truth for allowed UI)
  images/       provider fallback chain
  quote/        deterministic pricing + quote engine
  credits/      wallet, ledger, atomic spend/refund/grant
  stripe/       client + package/credit checkout helpers
  github/       repository agent (Octokit)
  deployment/   Vercel deploy agent
  export/       static HTML renderer + project file generator + ZIP
```

### Key guarantees

- **One project per user** — enforced by a unique constraint on `Project.userId`.
- **Credits are transactional** — `assertAndSpend` reads, writes the ledger, and updates the wallet atomically; balances never go negative; idempotency keys prevent double-charges. Failed generations refund automatically.
- **GitHub is always-on** — private repo created/updated after generation and on saves, independent of payment.
- **Payment gates delivery only** — ZIP export requires a package payment; live deploy requires the managed-hosting package.
- **AI output is untrusted** — sanitized and Zod-validated; only approved section variants render. AI routes are rate-limited.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Start the production server |
| `npm run db:push` | Sync the Prisma schema to Postgres |
| `npm run db:studio` | Open Prisma Studio |

## Notes

- The generated client site is a static HTML bundle (Tailwind via CDN), so it deploys to any static host with zero build step.
- The in-memory rate limiter suits a single instance; use a shared store (e.g. Redis) before scaling horizontally.
