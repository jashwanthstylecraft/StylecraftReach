# StylecraftReach (SC Reach)

Influencer marketing CRM for **StylecraftUS** — Phase 1: the CRM kanban board.

Tracks influencer relationships across GAMMA+, Johnny B, and Stylecraft campaigns from first
contact through completed campaigns: Shortlisted → Outreach sent → Negotiating → Active → Completed.

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres) · Clerk (auth) ·
`@dnd-kit` (drag and drop) · Recharts · Lucide icons.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then run the migrations against it
(SQL Editor, or the Supabase CLI):

```bash
supabase/migrations/001_initial_schema.sql   # tables
supabase/migrations/002_seed_data.sql        # 3 campaigns, 10 influencers, sample activity
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

## Notes on Phase 1 scope

- Adding an influencer from a kanban column links it to a campaign immediately, in that column's
  stage. Adding one from `/influencers/new` creates a standalone record with no campaign yet — the
  Supabase schema requires a campaign to place an influencer into a pipeline stage.
- AI relevance scores are entered manually for now (`ai_score` on the influencer). Phase 2 wires
  this up to Modash discovery + the Claude API — not built yet, by design.
- No Resend/Twilio/n8n integration yet (also Phase 2).

## Deploying

Push to a Git repo and import it in Vercel, then set the same environment variables there
(Project Settings → Environment Variables).
