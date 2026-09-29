# StylecraftReach (SC Reach)

Influencer marketing CRM for **StylecraftUS**.

Tracks influencer relationships across GAMMA+, Johnny B, and Stylecraft campaigns from first
contact through completed campaigns: Shortlisted → Outreach sent → Negotiating → Active → Completed.
Phase 2 adds an influencer discovery engine (Modash search + Claude relevance scoring) that feeds
straight into the same pipeline. Phase 3 adds affiliate link tracking (Dub.co), promo codes, and
an ROI dashboard on top of that. Phase 4 adds direct influencer payouts via Stripe Connect,
commission automation, and PDF invoices. Phase 5 adds a separate, lighter-themed portal
(`/portal/*`) where influencers log in, view briefs, submit content, and track earnings —
plus `/content-approvals` on the brand side to review what they submit. Phase 6 (final) adds
content capture, brand mention monitoring, competitor overlap tracking, and a Claude-generated
weekly intelligence digest.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres) · Clerk (auth,
role-based for Phase 5) · `@dnd-kit` (drag and drop) · Recharts · Lucide icons ·
Modash (creator discovery + content capture, Phases 2 & 6) · Anthropic API (AI relevance scoring +
sentiment analysis + digest generation, Phases 2 & 6) · Dub.co (affiliate links, Phase 3) ·
`@react-pdf/renderer` (performance report PDFs, Phase 3) · Stripe Connect (payouts, Phase 4) ·
`pdf-lib` (invoice PDFs, Phase 4) · `svix` (Clerk webhook verification, Phase 5).

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
supabase/migrations/006_phase4_payments.sql      # payments, invoices, payment_schedule, Stripe columns, storage bucket
supabase/migrations/007_phase4_seed.sql          # sample payments + a scheduled payment
supabase/migrations/008_phase5_portal.sql        # invitations, content_submissions, portal_messages, notification prefs
supabase/migrations/009_phase6_intelligence.sql  # captured_content, brand_mentions, tracked_hashtags, competitor_overlap, digests
supabase/migrations/010_phase6_seed.sql          # tracked hashtags + sample captured content, mentions, overlap
```

### 3. Create a Clerk application

Create an application at [clerk.com](https://clerk.com) (email/password or your preferred
provider). Sign-in and sign-up pages are already wired up at `/sign-in` and `/sign-up` (brand
team) and `/portal/sign-in` (influencers).

**One manual step Phase 5 needs that can't be done from code:** in the Clerk dashboard, go to
**Sessions → Customize session token** and add:
```json
{ "role": "{{user.public_metadata.role}}" }
```
Without this, `middleware.ts` can't tell brand users from influencers and everyone is treated as
`brand` — the app still works, it just won't route invited influencers into `/portal/*`.

If you want invite acceptance to actually link an influencer's new account back to their
`influencers` row (rather than just sending the invite), also add a Clerk webhook: **Webhooks →
Add Endpoint**, URL `{your app URL}/api/webhooks/clerk`, subscribe to `user.created`, and copy its
signing secret into `CLERK_WEBHOOK_SECRET`.

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
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Phase 2 — optional, see "Discovery engine" below
MODASH_API_KEY=
ANTHROPIC_API_KEY=

# Phase 3 — optional, see "Affiliate tracking" below
DUB_API_KEY=
DUB_WORKSPACE_ID=
N8N_CONVERSION_WEBHOOK_URL=
SHOPIFY_WEBHOOK_SECRET=

# Phase 4 — optional, see "Payments" below
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
N8N_PAYMENT_WEBHOOK_URL=

# Phase 5 — optional, see "Influencer portal" below
CLERK_WEBHOOK_SECRET=
N8N_PORTAL_WEBHOOK_URL=

# Phase 6 — optional, see "Content intelligence" below
CRON_SECRET=
N8N_STORY_CAPTURE_WEBHOOK=
N8N_POST_CAPTURE_WEBHOOK=
N8N_MENTION_CHECK_WEBHOOK=
N8N_DIGEST_GENERATE_WEBHOOK=
DIGEST_EMAIL_RECIPIENTS=
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
| `/payments` | Outstanding + payment history tabs, batch payout, Stripe onboarding status |
| `/payments/[influencerId]` | Per-influencer payout detail: onboarding, flat fee, commission, schedule |
| `/invoices` | Searchable invoice list with PDF download |
| `/content-approvals` | Brand reviews influencer content submissions: approve or request changes |
| `/portal` | Influencer home: earnings snapshot, active campaigns, activity feed |
| `/portal/campaigns` | All campaigns the signed-in influencer is part of, grouped by stage |
| `/portal/campaigns/[id]` | Brief, deliverables + content submission, gifts, earnings, message thread |
| `/portal/earnings` | Earnings summary, by-campaign breakdown, payout history with invoices |
| `/portal/profile` | Editable profile, Stripe bank connection, notification preferences |
| `/portal/onboarding` | 4-step first-time setup (welcome → profile → connect Stripe → done) |
| `/content-library` | Captured posts/reels/stories with filters, sentiment, feature/approve |
| `/mentions` | Brand mention feed with tracked-keyword sidebar and add-to-CRM/save/ignore |
| `/competitor-overlap` | Which creators also work with competitor brands, risk-scored |
| `/intelligence` | Current + past weekly intelligence digests |
| `/intelligence/[id]` | A single past digest |

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

## Payments (Phase 4)

This is the first phase that moves real money, so it was built mock-first on purpose (confirmed
with the user before writing any Stripe code).

- **Without `STRIPE_SECRET_KEY`**, `lib/stripe/client.ts` fakes Connect accounts, onboarding links,
  account status, and transfers — a mock transfer completes as `paid` immediately (there's no real
  Stripe to later fire a `transfer.paid` webhook). `/payments/[influencerId]` shows a
  **"Simulate onboarding complete"** button (mock mode only) so the whole payout flow — onboard →
  pay → invoice — is testable without a Stripe account.
- **`lib/payments-send.ts` never trusts a client-supplied dollar amount.** The transfer amount is
  always either the stored amount on an existing `pending` payment row, or a fresh sum of that
  influencer's unpaid `conversions.commission_amount` computed server-side at send time — this is
  the one place in the app moving real money, so it re-derives the number rather than trusting
  whatever the browser sent.
- Invoice PDFs are generated with `pdf-lib` (per the brief) and uploaded to a public Supabase
  Storage bucket (`stylecraftreach`); `lib/invoice-generation.ts` is shared by both the payout flow
  and the standalone `/api/invoices/generate` route so a PDF is never built two different ways.
- "Send via email" on the Stripe onboarding banner is a plain `mailto:` link, not a real send —
  Resend isn't installed in this project (same note as Phase 1–3's "no Resend yet").
- `/api/stripe/webhook` is publicly reachable (exempted in `middleware.ts`, same pattern as the
  Shopify conversion webhook) and verifies Stripe's signature when `STRIPE_WEBHOOK_SECRET` is set;
  without it, incoming events are trusted unverified so local testing doesn't require a real
  webhook secret.
- n8n workflow 3 (`docs/n8n-workflows.md`) documents the "payment sent" alert — not wired up, same
  as Phase 3's workflows.

## Influencer portal (Phase 5)

- **Role-based routing needs one manual Clerk dashboard step** (see Setup step 3 above) — until
  the `role` session claim is added, `lib/clerk-role.ts` defaults everyone to `brand`, so the app
  degrades to "Phase 1–4 only" rather than breaking.
- **The brief's RLS policies use `auth.uid()`**, which is Supabase Auth's session function — this
  app authenticates via Clerk, never Supabase Auth, so `auth.uid()` is always null here.
  `supabase/migrations/008_phase5_portal.sql` creates the tables and policies as specified (they're
  harmless — the service-role key this app always uses bypasses RLS entirely), but the real
  influencer-data isolation is application-layer: every portal read in `lib/portal-data.ts` is
  explicitly scoped by the signed-in influencer's `clerk_user_id`, not by Postgres RLS.
- **Invite acceptance requires the `CLERK_WEBHOOK_SECRET` webhook** (Setup step 3) to actually link
  a new influencer account to their `influencers` row via `clerk_user_id` — without it, "Send
  portal invite" still sends a real Clerk invitation email, but nothing connects the accepted
  account back to Supabase, so `/portal` won't find their data.
- **All four Phase 5 n8n workflows share one webhook URL** (`N8N_PORTAL_WEBHOOK_URL`), routed by a
  `type` field, rather than one env var each — see `docs/n8n-workflows.md`.
- Two things trimmed for scope, both purely cosmetic: profile photo upload (the onboarding wizard
  and profile page skip it — there's no avatar upload/storage UI built yet, only the existing
  `avatar_url` column) and a portal-themed `Modal`/`DataTable` (portal pages currently reuse the
  brand dashboard's dark-themed modal and table components as-is, so submission/preview dialogs
  look visually inconsistent with the rest of the light portal theme — everything on the two
  hand-built pages, `/portal/earnings`, is properly light-themed).
- "Approve" on `/content-approvals` marks the deliverable complete and, once *every* deliverable
  for that campaign placement is complete, flips `campaign_influencers.stage` to `Completed`
  automatically — the same stage Phase 1's kanban reads.

## Content intelligence (Phase 6, final)

- **Without `MODASH_API_KEY`**, all of content capture, mention search, and hashtag analytics
  (`lib/modash/content.ts`) run against deterministic mock data — same `MOCK_MODE` pattern as
  Phase 2's discovery search, extended to cover posts/stories/mentions/hashtags rather than just
  creator search. Real mode intentionally **throws** rather than guessing a request shape: Modash's
  public docs don't stably document a posts/mentions/hashtag-analytics endpoint as of this build,
  so pretending to call a real endpoint would silently return nothing instead of failing loudly.
- **Without `ANTHROPIC_API_KEY`**, sentiment analysis (`lib/sentiment.ts`) and the weekly digest's
  narrative (`lib/digest-generation.ts`) both fall back to templates built from the real aggregated
  numbers (a keyword-based mock scorer for sentiment, and a plain-language summary of the actual
  top content/mentions/competitor data for the digest) — same "real data, templated narrative"
  approach as Phase 2/3's mock fallbacks, just extended to two more call sites.
- **The five cron routes are called by n8n, not a browser**, so they're exempted from Clerk in
  `middleware.ts` and instead gated by a shared secret (`CRON_SECRET`, sent as `x-cron-secret` —
  see `lib/cron-auth.ts`) — same pattern as the Stripe/Shopify webhooks, but for scheduled polling
  rather than event delivery. `/content-library`'s "Capture now" button is the one exception: it
  hits `/api/cron/capture-stories` from a signed-in browser session, so that route accepts *either*
  the cron secret or a valid Clerk session.
- **Four of the five n8n workflows call back out** to their own `N8N_*_WEBHOOK` env var mid-run for
  an instant alert (story expiring soon, competitor content detected, high-reach mention, digest
  ready to send) — full detail on which route fires which webhook, and what to build on the n8n
  side, is in `docs/n8n-workflows.md`.
- The weekly digest email is rendered as HTML (`lib/email/digest-template.ts`) and stored on the
  digest row, but **sending it is n8n's job, not this app's** — same "no Resend installed" note as
  every earlier phase. "Send digest email" on `/intelligence` marks it sent and hands the rendered
  HTML to `N8N_DIGEST_GENERATE_WEBHOOK`; "View HTML email" opens the stored HTML directly
  (`/api/intelligence/digest-html/[id]`) so you can inspect or print it without n8n.
- Two things trimmed for scope: the brief's `[Reply]` action on `/mentions` was explicitly a
  placeholder for "future social integration" with nothing to wire it to, so it's omitted rather
  than built as a dead button; and `/mentions` risk labels reuse the same platform-neutral
  `SentimentBadge` styling as `/content-library` rather than a separate component, since the two
  are visually identical.

## Affable.ai feature upgrade (theming + Reports/Brand Comparison/Community/Social)

This pass added ten Affable.ai-style features on top of the six phases above, without touching
any of that existing code. Migrations `011_affable_upgrade.sql` and `012_affable_seed.sql` add
the schema; run them in order after migration 010.

- **Light/dark mode** — `tailwind.config.ts` colors are now CSS-variable references
  (`rgb(var(--color-x) / <alpha-value>)`) so opacity modifiers keep working; the actual values
  live in `app/globals.css` under `:root.dark` (default) and `:root.light`. An inline anti-FOUC
  script (`lib/theme-script.ts`) sets the class on `<html>` before paint from `localStorage` or
  `prefers-color-scheme`; `components/ui/ThemeToggle.tsx` in the header flips and persists it.
  The influencer portal (`/portal/*`) deliberately keeps its own fixed light theme — the
  `portal-*` Tailwind tokens stayed hardcoded, unaffected by this toggle.
- **EMV (Earned Media Value)** — `lib/utils/emv.ts` computes it (`likes×0.01 + comments×0.10 +
  views×0.003 + shares×0.05`) and formats it (`USD 1.20K`). It's backfilled onto
  `captured_content`/`brand_mentions` (migration 011) and shown on content cards, the dashboard's
  brand table, and Brand Comparison.
- **Reports** (`/reports`) — named, dated snapshots of a set of influencers (`lib/reports-data.ts`,
  `lib/reports-actions.ts`). Create, delete, merge (unions two reports' influencer/post sets into
  a new one), and a per-report detail view (`/reports/[id]`) with CSV export.
- **Brand Comparison** (`/brand-comparison`) — own brands vs. competitors (Braun/Wahl/Andis) on
  posts, reach, engagement, and EMV, aggregated from `tracked_hashtags` (`lib/brand-comparison-data.ts`).
  Competitor EMV is derived from the same reach/engagement columns already tracked per hashtag,
  not fabricated separately, since no real competitor-content-ownership data exists. The six brand
  colors are the dataviz skill's validated categorical order (adjacent-pair CVD-safe, ΔE ≥ 8.4 in
  dark mode) — see `DEFAULT_BRANDS` in `lib/affable-types.ts`.
- **Dashboard upgrade** — "Get Started" tiles (`components/dashboard/GetStartedTiles.tsx`) and an
  "Influencer Collaboration: Your Brand vs Competitors" table (`components/dashboard/BrandCollaborationTable.tsx`)
  were added above the existing Phase 1 Kanban board, which is untouched.
- **Global platform switcher** — a header dropdown (`components/layout/PlatformSwitcher.tsx`,
  `lib/platform-context.tsx`) persists a preferred platform to `localStorage` and is used as the
  *default* filter on pages that already have their own platform dropdown (e.g. Content Library);
  a page's own selector still overrides it. It's intentionally a soft default rather than a hard
  global filter, since forcing every existing page's data layer to obey one global param was out
  of scope for this pass.
- **Campaign cards** — now show `tracked_hashtags`/`tracked_mentions`/`budget_label` (added to
  `campaigns` in migration 011, seeded with the real Affable.ai account's hashtags/campaign names
  in 012) and a duplicate-campaign button (`lib/campaigns-actions.ts`).
- **Content cards** — checkbox multi-select with a bulk action bar ("Export selected" CSV, "Add
  influencers to..." a Community list) and an EMV badge (`components/intelligence/ContentCard.tsx`,
  `ContentLibraryGrid.tsx`).
- **Community** (`/community`) — named creator lists (`community_lists` table, `lib/community-data.ts`,
  `lib/community-actions.ts`) with CRUD, CSV export, and add-at-creation-time or add-from-Content-Library.
- **Social accounts** (`/settings/social-accounts`) — **stubbed by design**, per an explicit choice
  made mid-build: no real Meta/TikTok/Google OAuth app is registered (would need app review,
  redirect URLs on the deployed domain, and encrypted token storage), so `app/api/social/connect/
  {instagram,tiktok,youtube}/route.ts` redirect back with the specific missing-credential reason
  instead of faking a successful connection. The `social_connections` table and
  `lib/social-data.ts`/`lib/social-actions.ts` (list/disconnect) are real; only the OAuth handshake
  itself isn't built. Add `META_APP_ID`/`TIKTOK_CLIENT_KEY`/`GOOGLE_CLIENT_ID` (+ secrets) to move
  past "not configured" — the actual token exchange still needs writing.
- **CSV export everywhere** — `lib/utils/export.ts`'s `exportToCSV()` is wired into Reports,
  Brand Comparison, Community, and the Content Library bulk-select bar.

## Campaign detail rebuild + Brand Comparison rebuild + Community upgrade

A follow-up pass based on real Affable.ai screenshots of the live StylecraftUS account.
Migration `013_campaign_detail_upgrade.sql` adds the schema; run it after 012.

- **`/campaigns/[id]` was fully replaced** (the one deliberate non-additive rebuild in this
  project, explicitly requested) with a centered header (title, tracking date, hashtags/
  mentions), 7 stat cards backed by a `campaign_summary` SQL view (computed live, not
  denormalized columns — a campaign with many content pieces per influencer doesn't fan-out
  and inflate follower/reach totals, since influencer and content aggregates are computed in
  separate subqueries before joining), and 6 tabs: **Influencers** (4 sub-tabs — Invitations,
  Proposals, Product Gifting, Content Approval), **Content**, **Chats**, **Fixed Pay**,
  **Affiliates**, **Reports**. Nearly everything in the tabs reuses existing Phase 3–6
  components and data functions filtered to this one campaign, rather than duplicating them:
  `OutstandingTable`/`PayoutModal` (Fixed Pay), `LinkGenerator`/`LinksTable`/`PromoCodeForm`/
  `PromoCodesTable` (Affiliates), `SubmissionQueue` (Content Approval), `GiftTracker` per
  influencer (Product Gifting), `ContentLibraryGrid` (Content), and the existing
  `portal_messages` table + API route (Chats, now used from the brand side too).
- **Invitations table** — the 13-column table from the screenshot. The "Status" column
  (Invited/Accepted/Declined/Active/Published/Completed) is a *display* concept layered on
  top of the existing Kanban `stage` field via `deriveInvitationStatus()`
  (`components/campaigns/invitationStatus.ts`) — the Kanban board's `stage` stays the pipeline's
  one source of truth; `campaign_influencers.status` only overrides the derived label when a
  brand explicitly sets something the stage pipeline has no equivalent for (e.g. "Published").
  "Assignee" is a plain free-text name/email (`assignee_name`), not a picker over team
  members — this app has no Clerk Organizations/team-membership model to pick from.
- **Proposals** are a new `proposals` table (deliverables as jsonb, a fee, draft/sent/
  accepted/declined) — intentionally separate from `deliverables` (which is what actually
  gets checked off once work starts), so a proposal can be revised without touching delivery
  tracking.
- **"Send mails"** builds and merge-tags an email from a template, but **does not send a real
  email** — no provider (Resend or otherwise) is wired up. It writes to a new
  `campaign_emails_sent` audit table (`delivered` stays `false`) instead of silently
  succeeding, so the brand has a real record of what was drafted without the app claiming a
  delivery it can't back up.
- **"Add influencers"** supports both picking from existing influencers already in the CRM
  and adding a brand-new one by handle — it does not reopen the Modash discovery search
  modal inside the tab; that flow already exists at `/discover`.
- **Creator portal settings** (`creator_portal_settings`, one row per campaign) control what
  an influencer sees on `/portal/campaigns/[id]` and are edited via the header's
  "Edit creator portal" button — the checkboxes are stored but the portal page itself doesn't
  yet read them to conditionally hide sections (a follow-up, not done in this pass).
- **`/brand-comparison` was fully rebuilt** as a "Create Trends Dashboard" builder (brands,
  date range, hashtag/caption text filter, metric, MONTH/WEEK/DAY granularity, a sponsored-only
  checkbox mapped to `mentions_brand`, and a locations tag input that's informational only —
  it's stored with a saved dashboard but not yet used to filter results). The line chart is an
  **honest estimate, not real history**: nothing in this schema tracks per-day metrics, only
  running totals (`tracked_hashtags.post_count`/`total_reach`/`avg_engagement`), so the chart
  spreads each brand's real total across the selected range with a deterministic per-bucket
  variance (`generateTrendsSeries` in `lib/trends-dashboard-data.ts`) — a trend *shape*, not
  authoritative day-by-day data. The comparison table's "Top Influencer" column and the "Top
  posts per brand" thumbnails use real data (`captured_content`/`competitor_overlap`).
  Dashboards can be saved (`saved_dashboards`) and reloaded.
- **Community upgrade** — added an "All Creators" pseudo-list (every influencer, not tied to
  a saved list), three new columns (Eng%, EMV, Last contacted, Status — from a new
  `lib/community-stats.ts`), checkbox multi-select with a bulk "Add to campaign" action, and
  CSV import (parses `handle,platform,email,notes` client-side, calls the existing
  `createInfluencer` action per row). The underlying `community_lists` schema (an
  `influencer_ids` array) was kept as-is rather than rebuilt into a join table — the array
  already supports everything the new UI needs.

## Real TikTok connection

`/settings/social-accounts`'s TikTok card is a real OAuth connection (TikTok Login Kit v2),
not a mock — the first platform upgraded past the "build page + schema, stub the OAuth
calls" decision made earlier. Instagram and YouTube are still stubbed exactly as before.

- **Migration `014_tiktok_oauth.sql`** adds `avatar_url`/`likes_count`/`video_count`/
  `refresh_token_expires_at` to `social_connections`; run it after 013.
- **Scope is deliberately narrow**: `user.info.basic` + `user.info.stats` — the brand's own
  account stats (follower count, likes, video count), not creator/influencer discovery data.
  Pulling *other* creators' TikTok stats would need TikTok's Research API or a data provider
  (Modash already covers that role elsewhere in the app) — a separate, much heavier approval
  process from Login Kit.
- **Tokens are encrypted at rest** (`lib/social/encryption.ts`, AES-256-GCM, a fresh IV per
  value) before ever reaching Postgres — `ENCRYPTION_KEY` is required for
  `SOCIAL_APP_CONFIGURED.tiktok` to report `true`, not just the client key/secret.
- **The redirect URI is fixed, not derived per-request** (`lib/social/tiktok.ts`'s
  `getRedirectUri()` reads `NEXT_PUBLIC_APP_URL`) — Vercel serves this app on several aliases
  (production domain, `-git-main-`, preview URLs), but TikTok requires an exact string match
  on `redirect_uri`, so it has to be pinned to whichever one is actually registered in the
  TikTok for Developers dashboard, not whatever `origin` the incoming request happens to have.
- **`Sync now`** (the refresh icon next to a connected TikTok account) re-fetches account
  stats on demand, refreshing the access token first if it's expired — same token-refresh
  logic a scheduled cron would use, just triggered manually since no cron calls it yet.
- **CSRF state**: the connect route sets a short-lived, httpOnly `state` cookie scoped to
  `/api/social/connect/tiktok`; the callback route rejects the exchange if it's missing or
  doesn't match what TikTok echoes back.

## Deploying

Push to a Git repo and import it in Vercel, then set the same environment variables there
(Project Settings → Environment Variables).
