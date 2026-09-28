# StylecraftReach (SC Reach)

Influencer marketing CRM for **StylecraftUS**.

Tracks influencer relationships across GAMMA+, Johnny B, and Stylecraft campaigns from first
contact through completed campaigns: Shortlisted → Outreach sent → Negotiating → Active → Completed.
Phase 2 adds an influencer discovery engine (Modash search + Claude relevance scoring) that feeds
straight into the same pipeline. Phase 3 adds affiliate link tracking (Dub.co), promo codes, and
an ROI dashboard on top of that.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres) · Clerk (auth) ·
`@dnd-kit` (drag and drop) · Recharts · Lucide icons · Modash (creator discovery, Phase 2) ·
Anthropic API (AI relevance scoring, Phase 2) · Dub.co (affiliate links, Phase 3) ·
`@react-pdf/renderer` (performance report PDFs, Phase 3).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then run the migrations against it
(SQL Editor, or the Supabase CLI):

```bash
supabase/migrations/001_initial_schema.sql       # tables
supabase/migrations/002_seed_data.sql            # 3 campaigns, 10 influencers, sample activity
supabase/migrations/003_phase2_discovery.sql     # saved_creators, search_history, unique(handle, platform)
supabase/migrations/004_phase3_affiliate.sql     # affiliate_links, promo_codes, conversions, daily_stats
supabase/migrations/005_phase3_seed.sql          # sample promo codes, links, conversions, daily stats
```

### 3. Create a Clerk application

Create an application at [clerk.com](https://clerk.com) (email/password or your preferred
provider). No extra configuration needed — sign-in and sign-up pages are already wired up at
`/sign-in` and `/sign-up`.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in the values from Supabase (Project Settings → API)
and Clerk (API Keys):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Phase 2 — optional, see "Discovery engine" below
MODASH_API_KEY=
ANTHROPIC_API_KEY=

# Phase 3 — optional, see "Affiliate tracking" below
DUB_API_KEY=
DUB_WORKSPACE_ID=
N8N_CONVERSION_WEBHOOK_URL=
SHOPIFY_WEBHOOK_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only — all Supabase reads/writes happen in server
components and server actions (`lib/data.ts`, `lib/actions.ts`), gated by Clerk auth in
`middleware.ts`. It is never sent to the browser.

### 5. Run

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to sign in, then to `/dashboard`.

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Stats bar + kanban board across all campaigns |
| `/influencers` | Full influencer list |
| `/influencers/new` | Manually add an influencer |
| `/influencers/[id]` | Profile, communication log, deliverables, gifting tracker |
| `/campaigns` | Campaign list with budget/spend and pipeline counts |
| `/campaigns/[id]` | Single campaign: stats + influencers grouped by stage |
| `/discover` | Modash creator search with filters, AI relevance scoring, add-to-campaign |
| `/discover/[id]` | Full creator preview: audience charts, recent posts, AI analysis |
| `/discover/saved` | Creators saved from Discover but not yet on a campaign |
| `/analytics` | ROI dashboard: 6 stat cards, 4 charts, sortable top-performer table |
| `/analytics/[influencerId]` | Per-influencer performance, commission tracker, conversions, PDF report |
| `/links` | Affiliate link manager (generate via Dub.co, sync stats, revoke) |
| `/promo-codes` | Promo code manager (create with auto-suggested codes, activate/deactivate) |

## Notes on Phase 1 scope

- Adding an influencer from a kanban column links it to a campaign immediately, in that column's
  stage. Adding one from `/influencers/new` creates a standalone record with no campaign yet — the
  Supabase schema requires a campaign to place an influencer into a pipeline stage.
- No Resend/Twilio/n8n integration yet (Phase 3+).

## Discovery engine (Phase 2)

- **Without `MODASH_API_KEY`**, `/discover` runs against 20 realistic mock creator profiles
  (`lib/modash/mock-data.ts`) so the whole flow — search, filter, score, add to campaign — is
  testable with no external key. Set `MODASH_API_KEY` to switch to live Modash search
  (`lib/modash/client.ts`).
- **Without `ANTHROPIC_API_KEY`**, AI relevance scoring falls back to a deterministic scorer
  (`lib/ai-score.ts`) based on engagement, credibility, and audience gender — same shape as a real
  score, so the UI never blocks on a missing key. Set `ANTHROPIC_API_KEY` to score with Claude
  (`claude-sonnet-5`) instead.
- Profile caching: `/discover/[id]` checks `saved_creators` for a fresh (<24h) cached Modash
  profile before calling Modash again, but only reads that cache — merely viewing a profile never
  writes to `saved_creators`, so `/discover/saved` only ever shows creators someone deliberately
  saved.
- "Add to campaign" (from search results, a creator's profile, or the saved list) upserts into
  `influencers` (on conflict `handle, platform`) and links it into `campaign_influencers` at the
  `Shortlisted` stage — the same tables Phase 1's kanban reads from, so a discovered creator shows
  up on `/dashboard` immediately.

## Affiliate tracking (Phase 3)

- **Without `DUB_API_KEY`**, link creation and analytics (`lib/dub/client.ts`) fall back to a
  deterministic mock — creating a link returns a fake `screach.link/...` short URL, and syncing
  returns believable (seeded, so stable-ish) click/conversion/revenue numbers. Set `DUB_API_KEY`
  (and optionally `DUB_WORKSPACE_ID`) to switch to real Dub.co.
- `/analytics/[influencerId]`'s route segment holds a `campaign_influencer_id`, not a bare
  influencer id — performance, links, promo codes, and conversions are all scoped to one campaign
  placement, matching Phase 1's data model (one influencer can be in multiple campaigns).
- The conversion webhook (`app/api/webhooks/conversion/route.ts`) is publicly reachable
  (`middleware.ts` exempts `/api/webhooks/*` from Clerk auth, since Shopify calling it won't have a
  session) and verifies Shopify's HMAC signature when `SHOPIFY_WEBHOOK_SECRET` is set; without it,
  verification is skipped so you can test locally with a plain `curl` POST. If
  `N8N_CONVERSION_WEBHOOK_URL` is unset, the alert POST at the end simply doesn't fire — no error.
- Two deliberate deviations from the brief, both accessibility-driven (see `dataviz` skill): the
  clicks/conversions line chart uses blue/aqua instead of the brief's gold/green pairing (gold+green
  fails colorblind-safety validation at ΔE 3.1 — a deuteranope literally can't tell them apart), and
  the per-influencer page's "clicks + conversions" chart shares one axis rather than the brief's
  dual-axis line (dual-axis / two y-scales is the #1 chart anti-pattern — it invites misleading
  visual comparisons). Both series are still on their original scale on one axis since they aren't
  orders of magnitude apart in this data.
- "Download report PDF" is generated at request time with `@react-pdf/renderer` inside
  `app/api/analytics/report/[influencerId]/route.tsx`, not via a bundled static file — the brief's
  "generates PDF via the pdf skill" meant Claude's own document-editing skill, which only runs
  inside a Claude conversation and isn't something a deployed Next.js route can call at runtime.
- "Revoke" on `/links` deletes the local `affiliate_links` row (Dub.co has no documented revoke
  endpoint in the brief) — the short link itself would need deactivating in the Dub.co dashboard
  directly if you want it to stop resolving.
- n8n isn't wired up — `docs/n8n-workflows.md` documents both workflows (daily sync, instant
  conversion alert) step by step, ready to build in your n8n instance.

## Deploying

Push to a Git repo and import it in Vercel, then set the same environment variables there
(Project Settings → Environment Variables).
