# Agency Partner Interactive — AI Website Builder

A self-service platform that turns a short business questionnaire into a finished website: preview it, edit it, get an automated quote, pay with Stripe, then download a ZIP or go live on a subdomain.

This README is the working picture of the project: **what it was built to do**, **what is already in place**, and **what still has to be achieved**.

---

## What this project set out to do

The original goal was an automated website studio for agencies and businesses — not a chatbot that dumps HTML.

A user signs up, describes their business, and receives a professional site. The first generation uses a **heavy AI model API** for planning, copy, SEO, and structured output. Later edits use a **lightweight model API** so small rewrites stay cheap. There is **no local AI**. Models never write unrestricted frontend code. They produce a `WebsiteBlueprint` JSON; the app maps that onto approved ShadCN / Tailwind / Next.js sections.

The rest of the product was meant to run without a human in the loop:


| Area     | Original intent                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------- |
| Images   | Licensed stock, in order: Shutterstock → Pexels → Unsplash, then a placeholder                    |
| Pricing  | A deterministic quote engine — never an AI guess                                                  |
| Payment  | Stripe: one-time ZIP (self-hosting) or creation fee + monthly (managed hosting)                   |
| Credits  | Credits gate AI work; Stripe package payment gates delivery                                       |
| Backup   | Paid websites committed to the **AI-WEBSITE-BUILDER-WEBSITE** GitHub repo under `clients/<slug>/` |
| Delivery | ZIP download, or automatic publish to `<subdomain>.PLATFORM_DOMAIN`                               |
| CRM      | After a website-package payment, upsert the paying customer in HubSpot                            |
| Notify   | Email the owner when the ZIP is ready or the site goes live                                       |
| Database | Prisma as the only data layer (originally SQLite, now Postgres)                                   |


The architecture is a set of named agents (orchestrator, planner, validator, assembler, quote, payment, GitHub, deploy, export, QA, security). They can stay as server functions; the names exist so responsibilities stay clean. Full agent contracts live in `AGENTS.md`. System design lives in `architecture.md`. Template authoring lives in `TEMPLATES.md`.

---



## What is currently in place

The core product loop works end to end in this repo.

### Product flow

1. **Auth** — Better Auth email signup/login. When SMTP is configured, new accounts must verify their email before they can use the app. New accounts receive a starter credit bonus.
2. **Template library** — Users pick a complete, locked design (bespoke renderers such as ForgeTech, Techvantage, CraftedSpaces, plus standard-section designs). The AI fills content slots; it cannot invent layout.
3. **Questionnaire** — Structured answers (business, audience, services, tone, style, pages, package). Optional **existing-website import** scrapes brand assets (logo, colors, images) with consent tracking.
4. **Generate** — Heavy Cursor model, then a deterministic template fallback. Output is Zod-validated, sanitized, and forced onto the chosen template's slots.
5. **Preview & editor** — Live preview (desktop / tablet / mobile), manual edits (text, images, theme, fonts, icons), and optional lightweight AI section rewrites.
6. **Credits** — Wallet + ledger with atomic spend, refund on failed generation, and Stripe credit packs. Customer credit prices stay separate from provider cost.
7. **Admin AI usage** (`/app/admin/usage`) — Tokens and estimated provider dollars for each website, broken down by generation, pages and sections plan, scraper AI, photo analysis, and later edits. Starter-content fallbacks are counted here and are not billed. Admins review lead scores and marketing consent at `/app/admin/clients`.
8. **Quote & pay** — Deterministic quote page; Stripe Checkout for website packages and credit packs; webhook + reconcile path.
9. **Deliver** — ZIP export for self-hosting; after website-package payment, the static site is committed into **AI-WEBSITE-BUILDER-WEBSITE** at `clients/<slug>/`; managed hosting publishes the site to the `sites` bucket and serves it at `<subdomain>.PLATFORM_DOMAIN`; HubSpot and SMTP owner mail when configured.



### Platform work already done

- **One VPS, Docker Compose.** The app (Next.js standalone build), Postgres, Garage (S3-compatible storage), Caddy (automatic HTTPS), cron and nightly backups run as one stack. See [Deploy on a VPS](#deploy-on-a-vps).
- **Postgres** is the only database. Prisma uses `DATABASE_URL` and plain `prisma migrate deploy`.
- **Garage** holds scraped and uploaded images in the `media` bucket (served at `MEDIA_DOMAIN`) and published customer sites in the `sites` bucket.
- **15 published templates** are seeded in the database (10 from the original library plus later designs such as ForgeLime, Mainfile, SaaS LDG, Sports, and Whiter).



### Stack

Next.js 15 (App Router), TypeScript, Tailwind, ShadCN, Prisma + Postgres, Garage (S3), Caddy, Better Auth, Stripe, Cursor API.

Agents live as functions under `lib/agents/`. AI providers, blueprint schemas, the section registry, credits, quote, Stripe, GitHub, deploy, and ZIP export sit beside them under `lib/`.

---



## Goals still to achieve

These are the remaining product and production goals — not a dump of every possible improvement.

### Make delivery production-ready

- Run GitHub backup, managed-hosting publishes, HubSpot customer sync, and owner emails against **live keys**, not just local stubs.
- Confirm Stripe webhooks, website-package checkout, and credit-pack checkout in a real Stripe environment (test, then live).
- Prove the ZIP and live-site paths on paid projects: self-hosting download, managed hosting going live at `<subdomain>.PLATFORM_DOMAIN`.



### Finish the generation quality bar

- Keep the heavy Cursor model as the default first generation; keep the template fallback **unbilled** when the model fails.
- Tighten QA so empty sections, missing CTAs, broken images, and weak SEO do not ship to preview.
- Grow the template library with more locked, industry-ready designs without letting the AI invent unsupported sections.



### Operate it as a real service

- One-project-per-user is still the product rule. If agencies need several sites, that is a deliberate schema and UX change — not a silent exception.
- Replace the in-memory rate limiter with a shared store before running more than one app container.
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
npm run db:migrate         # apply the Prisma migrations to Postgres
npm run dev                # http://localhost:3000
```

Local development needs a Postgres server in `DATABASE_URL`. The app runs without external keys: AI falls back to a deterministic template blueprint, images fall back to placeholders, and payments / GitHub / deploy degrade gracefully. Production runs from Docker Compose; see [Deploy onnpm run dev a VPS](#deploy-on-a-vps).

### Environment variables

See `.env.example` for the full list. Highlights:


| Variable                                                                                              | Purpose                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                        | Postgres URL. Inside Docker Compose it is built from `POSTGRES_*` instead                                                                                 |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                                                               | Auth session signing secret, and the public app URL                                                                                                       |
| `NEXT_PUBLIC_APP_URL`                                                                                 | Public app URL, baked in at build time                                                                                                                    |
| `CURSOR_API_KEY`                                                                                      | Cursor SDK key (the only AI provider)                                                                                                                     |
| `HEAVY_MODEL_NAME` / `LIGHT_MODEL_NAME`                                                               | Cursor models for generation vs. edits                                                                                                                    |
| `CURSOR_TIMEOUT_MS`                                                                                   | How long to wait on Cursor for a full website before template fallback (default 270s)                                                                     |
| `CURSOR_LIGHT_TIMEOUT_MS`                                                                             | How long to wait for site plan, import extract, and section edits (default 270s)                                                                          |
| `AI_USE_MOCK`                                                                                         | `true` to skip APIs and use the local template                                                                                                            |
| `SIGNUP_CREDIT_BONUS`, `CREDIT_COST_HEAVY_GENERATE`, `CREDIT_COST_LIGHT_EDIT`                         | Credit economics                                                                                                                                          |
| `PEXELS_API_KEY`, `UNSPLASH_ACCESS_KEY`                                                               | Stock image providers                                                                                                                                     |
| `IMAGE_VISION_ENABLED`                                                                                | `false` to place photos from provider descriptions only (default `true`)                                                                                  |
| `VISION_MODEL_NAME`                                                                                   | Model that looks at photos before placing them (default: `HEAVY_MODEL_NAME`)                                                                              |
| `IMAGE_VISION_TIMEOUT_MS`, `IMAGE_VISION_MAX_IMAGES`                                                  | Photo-analysis time limit (90s) and photos per call (36)                                                                                                  |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                                                          | Payments                                                                                                                                                  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                                                                  | Stripe publishable key, baked in at build time                                                                                                            |
| `STRIPE_CREDIT_PACK_SMALL_PRICE_ID`                                                                   | Small pack — 20 credits, $10. Omit to use an inline price                                                                                                 |
| `STRIPE_CREDIT_PACK_MEDIUM_PRICE_ID`                                                                  | Medium pack — 60 credits, $29                                                                                                                             |
| `STRIPE_CREDIT_PACK_LARGE_PRICE_ID`                                                                   | Large pack — 100 credits, $45                                                                                                                             |
| `STRIPE_SELF_HOSTING_PRICE_ID`, `STRIPE_MANAGED_CREATION_PRICE_ID`, `STRIPE_MANAGED_MONTHLY_PRICE_ID` | Website package prices                                                                                                                                    |
| `HUBSPOT_API_KEY`                                                                                     | Private-app token, sent as a Bearer token. Absent, the whole CRM integration no-ops                                                                       |
| `HUBSPOT_API_BASE_URL`                                                                                | API host (default `https://api.hubapi.com`)                                                                                                               |
| `HUBSPOT_API_VERSION`                                                                                 | Objects API version (default `2026-09`)                                                                                                                   |
| `HUBSPOT_ASSOCIATIONS_API_VERSION`                                                                    | Associations API version (default `2026-09`)                                                                                                              |
| `HUBSPOT_DEAL_PIPELINE`                                                                               | Optional deal pipeline override. Default `941017774` (Preview Generated → Content Generation → Credit Bought → Quotation Generated → Closed Won)          |
| `CRON_SECRET`                                                                                         | Bearer secret for `/api/cron/hubspot` and `/api/cron/deactivate-accounts`. Unset disables both                                                            |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`                                     | SMTP for account verification and owner mail. Port defaults to `587`. Implicit TLS is used on `465`; other ports (including Mailtrap `2525`) use STARTTLS |
| `NOTIFY_FROM_EMAIL`                                                                                   | Shared From address for verification mail and owner notify (ZIP ready / site live)                                                                        |
| `GITHUB_TOKEN`, `GITHUB_ORG`                                                                          | Token needs **write** on **AI-WEBSITE-BUILDER-WEBSITE**. Org is the repo owner when `GITHUB_SITES_REPO` is unset                                          |
| `GITHUB_SITES_REPO`                                                                                   | Optional `owner/AI-WEBSITE-BUILDER-WEBSITE` override                                                                                                      |
| `GITHUB_REPO_VISIBILITY`                                                                              | Unused for the shared sites repo (that repo already exists)                                                                                               |
| `S3_ENDPOINT`, `S3_REGION`                                                                            | S3 API (Garage). Compose sets the endpoint to `http://garage:3900`; region defaults to `garage`                                                           |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`                                                            | Garage key printed by `deploy/garage/init.sh`                                                                                                             |
| `S3_MEDIA_BUCKET`, `S3_SITES_BUCKET`                                                                  | Image bucket (`media`) and published-sites bucket (`sites`)                                                                                               |
| `S3_PUBLIC_URL`                                                                                       | Public base URL for images, `https://<MEDIA_DOMAIN>`. Baked in at build time                                                                              |
| `PLATFORM_DOMAIN`                                                                                     | Managed-hosting sites are served at `<subdomain>.PLATFORM_DOMAIN`. Unset disables publishing                                                              |




### Local Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

### HubSpot CRM

A login drops a HubSpot **lead** immediately (contact with `lifecyclestage=lead`).
Each later scoring step appends a Note on that contact so the HubSpot timeline
shows progress in order. Every account is synced from its first login, whether
or not it ever buys anything.


| Step                                         | Group      | Points |
| -------------------------------------------- | ---------- | ------ |
| Logged in (once per account)                 | Engagement | +5     |
| Completed questionnaire (once per account)   | Fit        | +15    |
| Small credit pack (every purchase)           | Engagement | +10    |
| Medium credit pack (every purchase)          | Engagement | +15    |
| Large credit pack (every purchase)           | Engagement | +20    |
| Website package purchased (once per payment) | Engagement | +25    |


Scoring follows [HubSpot’s lead scoring model for deals](https://knowledge.hubspot.com/scoring/understand-the-lead-scoring-tool):
engagement and fit groups with caps (60 / 40), an overall score limit of 100,
and combined thresholds **A1–C3** (letter = fit, number = engagement). The
capped combined value is what we write to the Lead Score property and what
appears on the deal description.

Each account also gets a HubSpot **Lead** record (the Leads object), associated
to the contact as its primary contact. The lead name is the person or business
name only. The numeric score is written to `lead_score`, and `hs_lead_label`
follows it: COLD under 20, WARM from 20, HOT from 30. A new lead starts in the
**New** stage of the lead pipeline; after that the stage is left for sales reps
to move until payment.

Completing the questionnaire opens a deal on pipeline `941017774` named
`Company $Amount`, associated with the contact and company. The deal stage
advances with progress:


| Milestone             | Stage               |
| --------------------- | ------------------- |
| Questionnaire saved   | Preview Generated   |
| Website generated     | Content Generation  |
| Credit pack purchased | Credit Bought       |
| Quote calculated      | Quotation Generated |
| Website package paid  | Closed Won          |


The description carries every questionnaire answer. Credit-pack purchases update
that same deal's amount and line items even if the website is not bought yet.
Paying for the website package moves the lead and the deal to **Closed Won**,
sets the close date, adds the website charge to the total, and moves the contact
to `customer`. HubSpot's built-in lead pipeline has no Closed Won stage, so the
integration creates one (label "Closed Won") the first time it is needed.

Lead scores and marketing consent also stay in **our database**. Admins review
that local data at `/app/admin/clients`.

The integration writes **standard HubSpot properties only**. Do not create custom
contact or deal properties.

**Contact (standard):** `email`, `firstname`, `lastname`, `company`, `phone`, `website`, `lifecyclestage`, `hs_analytics_source` (Direct Traffic)  
**Lead:** `hs_lead_name` (person/business only), `lead_score` (numeric score),
`hs_lead_label`, `hs_lead_type`, `hs_pipeline`, `hs_pipeline_stage`  
**Company:** `name`, optional `domain` (from the customer's existing website)  
**Progress history:** one HubSpot Note per score event, associated to the contact  
**Deal (standard):** `dealname` (`Company $Amount`), `amount` (every paid credit
pack + website package when paid), `description` (website URL + HubSpot-style
deal score A1–C3 + questionnaire answers + itemized payments), `pipeline`
(`941017774`) / `dealstage` (progress stages above; Closed Won sets `closedate`).
Associated with contact, company, and lead. If the description would overflow,
the full details are attached as a Note on the deal.

#### Setup

1. Create a HubSpot private app with the scopes below.
2. Set `HUBSPOT_API_KEY`, `HUBSPOT_API_BASE_URL=https://api.hubapi.com`,
  `HUBSPOT_API_VERSION=2026-09`, `HUBSPOT_ASSOCIATIONS_API_VERSION=2026-09`.
   Optional: `HUBSPOT_DEAL_PIPELINE` (defaults to `941017774`), `HUBSPOT_LEAD_PIPELINE`,
   `HUBSPOT_LEAD_NEW_STAGE`, `HUBSPOT_LEAD_CLOSED_WON_STAGE`, `HUBSPOT_LEAD_OWNER_ID`,
   `HUBSPOT_LEAD_SCORE_PROPERTY` (defaults to `lead_score`), `CRON_SECRET`.
   Leave the lead pipeline settings blank to look them up from HubSpot (recommended).
   Set `HUBSPOT_LEAD_OWNER_ID` to a HubSpot owner id so new Leads appear under
   "My leads" (Settings → Users & Teams → open a user → Owner ID).
3. Apply the Prisma migrations (`npm run db:migrate`; in Docker the `migrate` service does this).
4. `npm run hubspot:verify` — confirms the token can read contacts and leads.
  Never prints the key.



#### Private app scopes


| Scope                                                       | Needed for                                              |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| `crm.objects.contacts.read`, `crm.objects.contacts.write`   | Contact upsert                                          |
| `crm.objects.deals.read`, `crm.objects.deals.write`         | Purchase deals and contact/company/lead association     |
| `crm.objects.companies.read`, `crm.objects.companies.write` | Company records associated with deals and contacts      |
| `crm.objects.notes.write`                                   | Progress notes on the contact, plus overflow deal notes |
| `crm.objects.leads.read`, `crm.objects.leads.write`         | Lead records and their Closed Won stage                 |




#### Lead / deal scoring

Point values and package definitions live in `lib/crm/config.ts` and
`lib/constants.ts`; change them there, never in business logic. The running
total and the event log are stored in `CrmProfile` / `CrmScoreEvent`.

Scoring follows HubSpot’s combined engagement + fit model for deals (group
limits 60 / 40, overall limit 100, thresholds A1–C3). The capped combined score
is what HubSpot and the admin clients page show.


| Action                                 | Group      | Points | Frequency        |
| -------------------------------------- | ---------- | ------ | ---------------- |
| Registers or logs in                   | Engagement | 5      | Once per account |
| Completes the questionnaire            | Fit        | 15     | Once per account |
| Buys the Small pack (20 credits, $10)  | Engagement | 10     | Every purchase   |
| Buys the Medium pack (60 credits, $29) | Engagement | 15     | Every purchase   |
| Buys the Large pack (100 credits, $45) | Engagement | 20     | Every purchase   |
| Buys the website package               | Engagement | 25     | Once per payment |


Theme selection no longer scores. Filling the questionnaire by hand and
importing it with the scraper are the same event: together they are worth 15
fit points, not 30.

#### Marketing consent

The checkbox on the login and signup pages starts unchecked. The answer and its
timestamp are stored in `CrmProfile` and are **not** sent to HubSpot.

Ticking it on a later login opts in; leaving it unticked at login preserves an
existing opt-in rather than silently withdrawing it.

**Contacts without consent are still created in HubSpot** so scoring and purchase
deals work. Marketing must be driven from `/app/admin/clients`, not HubSpot
lists. The app never marks a contact as a marketing contact and never calls
HubSpot's marketing APIs.

#### How syncing works

Nothing calls HubSpot on the request path. Handlers write a row to the
`CrmOutbox` table and return, so a slow or broken HubSpot can never block
signup, the questionnaire, checkout, or deployment.

```
request → Postgres (score / consent / payment) → outbox row → response
                                                     ↓
                            after(): immediate best-effort drain
                                                     ↓
                            /api/cron/hubspot: durable retry every 10 minutes
```

Jobs retry with exponential backoff and jitter, honor `Retry-After` on 429 and
477, and give up after `HUBSPOT_MAX_JOB_ATTEMPTS` (default 6) with the reason in
`CrmOutbox.lastError` and `CrmProfile.hubspotLastError`. Authentication and
validation errors are not retried.

Deploy note: the `cron` container calls the endpoint with `CRON_SECRET`. Without
it the endpoint returns 503 and the queue is only drained by the post-response
nudge.

### Account deactivation

Accounts older than **14 days** that never bought a website package **and** never
bought a credit pack are deactivated automatically (`/api/cron/deactivate-accounts`
daily at 06:15 UTC, or `npm run accounts:deactivate -- --apply`). Website buyers, credit-pack
buyers, and admins stay active. Deactivated users cannot sign in.

#### Testing it

```bash
npm test                                  # HubSpot client, service, and scoring
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then, with `HUBSPOT_API_KEY` pointed at a test portal:

1. Sign up or log in with the consent box **unticked**. HubSpot gets a **lead**
  contact and a note: "Logged in / +5 points / Lead score: 5". Admin clients
   shows the same score. Consent stays in our DB only.
2. Pick a design — HubSpot gets a second note (score 10). Complete the
  questionnaire — a third note (score 30) and an open deal on the Sales Pipeline
   with every questionnaire answer on `description`.
3. Buy the Medium credit pack with card `4242 4242 4242 4242` (score 50, another
  note). The same deal's amount and line items update to include the pack.
4. Pay for a website package. The deal moves to Closed Won, the close date is
  set, and the website charge is added to the total. The contact and lead move
   to customer / Closed Won.
5. Log in again with the box **ticked**: admin clients shows consent true; the
  score does not move; HubSpot is unchanged on those fields.

To inspect the queue: `select kind, status, attempts, "lastError" from "CrmOutbox";`
Re-run a parked job by setting `status` back to `PENDING`.

### Paid sites repo

Create the GitHub repository **AI-WEBSITE-BUILDER-WEBSITE** (already done in this setup). Grant `GITHUB_TOKEN` write access. Set `GITHUB_ORG` to the owner, or set `GITHUB_SITES_REPO` to `owner/AI-WEBSITE-BUILDER-WEBSITE`.

After a website-package payment succeeds (Stripe webhook or checkout reconcile), the generated static files are committed to `clients/<business-slug>-<id>/` on `main`. Later editor saves and regenerations update that folder only while the project is paid. Unpaid drafts stay in this app’s database.

### Scripts


| Command                      | Description                                                         |
| ---------------------------- | ------------------------------------------------------------------- |
| `npm run dev`                | Start the dev server                                                |
| `npm run build`              | `prisma generate` + production build                                |
| `npm run start`              | Start the production server                                         |
| `npm run db:migrate`         | Apply Prisma migrations (`prisma migrate deploy`)                   |
| `npm run db:push`            | Sync the Prisma schema to Postgres without a migration (local only) |
| `npm run db:studio`          | Open Prisma Studio                                                  |
| `npm test`                   | HubSpot client, CRM service, and lead-scoring tests                 |
| `npm run hubspot:verify`     | Check HubSpot config and that the token can read contacts           |
| `npm run validate`           | Template, icon, and lock checks                                     |
| `npm run templates:populate` | Upsert the local template catalog into Postgres                     |


---



## Deploy on a VPS

Production is one Linux server running Docker Compose. Everything is defined in `docker-compose.yml`, `Dockerfile` and `deploy/`.


| Service    | What it does                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| `caddy`    | The only public service (ports 80 and 443, TCP and UDP). HTTPS for every hostname, then proxies to the app or Garage |
| `app`      | The Next.js standalone server on port 3000                                                                           |
| `migrate`  | Runs once on every `up`: `prisma migrate deploy`, then the seed. The app waits for it to succeed                     |
| `postgres` | Postgres 17, data in the `postgres_data` volume                                                                      |
| `garage`   | S3-compatible storage. The `media` bucket holds images, the `sites` bucket holds published customer sites            |
| `cron`     | Calls `/api/cron/hubspot` every 10 minutes and `/api/cron/deactivate-accounts` daily at 06:15 UTC                    |
| `backup`   | Nightly `pg_dump` into the `backups` volume, keeping 7 daily and 4 weekly copies                                     |


Postgres, the Garage S3 and admin APIs, and the app port stay on the internal Docker network.

### 1. DNS

Point three names at the server's IP address:


| Record                         | Example               | Serves                      |
| ------------------------------ | --------------------- | --------------------------- |
| `DOMAIN`                       | `app.example.com`     | The app                     |
| `MEDIA_DOMAIN`                 | `media.example.com`   | Uploaded and scraped images |
| `*.PLATFORM_DOMAIN` (wildcard) | `*.example-sites.com` | Published customer sites    |


Use a separate domain for `PLATFORM_DOMAIN` (as above), or at least a subdomain such as `*.sites.example.com`. Customer sites then never share the app's cookies. A separate registrable domain is the safest choice, because a site under `example.com` can still set cookies for all of `example.com`.

Caddy gets certificates for `DOMAIN` and `MEDIA_DOMAIN` at startup. Customer subdomains get theirs on their first visit, and only after the app confirms the subdomain is a deployed site (`/api/sites/tls-check`). No DNS-provider plugin or wildcard certificate is needed.

Open ports 80 and 443 (TCP) and 443 (UDP) in the server firewall. Nothing else needs to be reachable.

### 2. Environment

Clone the repo on the server and put `.env` in the repo root; `.env.example` lists every app setting. If `.env` comes from `stripe projects env --pull`, add the values below as project variables (`stripe projects variables set <name> --env-key <KEY>`) and pull again rather than editing the generated file. Compose reads this one file twice: it passes the whole file to `app` and `migrate`, and it uses it to fill the `${...}` values in `docker-compose.yml`.

Values the stack itself needs:


| Variable                                                 | Notes                                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `DOMAIN`, `MEDIA_DOMAIN`, `PLATFORM_DOMAIN`              | Hostnames from step 1, without `https://`                                             |
| `POSTGRES_PASSWORD`                                      | Required. Letters and digits only, because it goes into a URL: `openssl rand -hex 24` |
| `POSTGRES_USER`, `POSTGRES_DB`                           | Optional. Default `app` and `website_builder`                                         |
| `GARAGE_RPC_SECRET`                                      | Required. Exactly 64 hex characters: `openssl rand -hex 32`                           |
| `GARAGE_ADMIN_TOKEN`                                     | Required: `openssl rand -base64 32`                                                   |
| `CRON_SECRET`                                            | Required: `openssl rand -hex 32`                                                      |
| `CADDY_TLS_MODE`                                         | Optional. `public` (default) or `internal` for Caddy's local CA when testing          |
| `BACKUP_HOUR`, `BACKUP_KEEP_DAILY`, `BACKUP_KEEP_WEEKLY` | Optional. Default `3` (UTC), `7`, `4`                                                 |


App values to set for the server:


| Variable                                                                         | Value                                                 |
| -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_URL`                                         | `https://<DOMAIN>`                                    |
| `BETTER_AUTH_SECRET`                                                             | `openssl rand -base64 32`                             |
| `S3_PUBLIC_URL`                                                                  | `https://<MEDIA_DOMAIN>`                              |
| `S3_REGION`, `S3_MEDIA_BUCKET`, `S3_SITES_BUCKET`                                | `garage`, `media`, `sites`                            |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`                                       | Printed by the Garage step below                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, Stripe, Cursor, SMTP, HubSpot, GitHub keys | As in [Environment variables](#environment-variables) |


Compose sets `DATABASE_URL` (from `POSTGRES_*`) and `S3_ENDPOINT` (`http://garage:3900`) itself, so the values in `.env` for local development are ignored inside the stack.

`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `S3_PUBLIC_URL` are baked into the build. After changing them, rebuild with `docker compose up -d --build`.

### 3. Start Garage and create the buckets

```bash
docker compose up -d garage
bash deploy/garage/init.sh
```

The script assigns the storage layout (50 GB by default; set `GARAGE_CAPACITY=200G` to change it), creates the `media` and `sites` buckets and an `app` key, grants the key access, and serves `media` at `MEDIA_DOMAIN`. It prints the `S3_*` lines to paste into `.env`. Running it again changes nothing and prints the same key.

### 4. Start the stack

```bash
docker compose up -d --build
docker compose ps
curl https://<DOMAIN>/api/health
```

`migrate` applies the migrations and seeds the templates, then exits. `app` starts once it succeeds. If `migrate` fails, read `docker compose logs migrate`.

### 5. Point Stripe at the server

In the Stripe dashboard, change the webhook endpoint to `https://<DOMAIN>/api/stripe/webhook`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`, then run `docker compose up -d` so the app picks it up.

### 6. Load the template catalog

After migrations and seed have run, upsert the local template catalog with `npm run templates:populate`. New slugs are inserted and existing catalog fields are updated. Rows that exist only in the database are left in place, and `published` and `sortOrder` are not changed.

### Backups and restore

`backup` dumps the database every day after `BACKUP_HOUR` (UTC) to `/backups/daily/<db>-<date>.dump`. Sunday's dump is also kept in `/backups/weekly/`. It keeps 7 daily and 4 weekly files.

```bash
docker compose exec backup sh /usr/local/bin/backup.sh once   # take a dump now
docker compose exec backup ls /backups/daily /backups/weekly  # list dumps
docker compose cp backup:/backups ./backups                   # copy them off the container
```

Copy the dumps off the server regularly. They only cover Postgres. Images and published sites live in the `garage_meta` and `garage_data` volumes, so include those in your server snapshots.

To restore a dump:

```bash
docker compose stop app cron
docker compose exec backup sh -c 'pg_restore --clean --if-exists --no-owner --no-acl -d "$PGDATABASE" /backups/daily/website_builder-2026-10-16.dump'
docker compose start app cron
```

To restore a dump from another machine, copy it in first with `docker compose cp ./file.dump backup:/backups/restore.dump`.

### Updates

```bash
git pull && docker compose up -d --build
```

`migrate` runs again first, applying any new migrations and re-running the seed.

### Running notes

- Run exactly one `app` container. The rate limiter keeps its counters in memory, so a second container would double every limit.
- AI generation requests can take about five minutes. Caddy's upstream timeouts are ten minutes, so it never cuts them off.
- Logs: `docker compose logs -f app` (also `caddy`, `cron`, `backup`). Each container keeps 5 files of 10 MB.
- To try the stack on a laptop, set `DOMAIN=localhost`, `MEDIA_DOMAIN=media.localhost` and `PLATFORM_DOMAIN=sites.localhost`. Caddy serves `.localhost` names with its own CA, so use `curl -k`. For other test hostnames, set `CADDY_TLS_MODE=internal`.

---



## Notes

- Generated client sites are a static HTML bundle (Tailwind via CDN), so they deploy to any static host with no build step.
- The generated client must never contain server secrets.
- Further reading: `AGENTS.md` (agent contracts), `architecture.md` (system design), `TEMPLATES.md` (how to add a design).

