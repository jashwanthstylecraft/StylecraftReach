# n8n workflows

Twelve workflows to build in n8n (`josepho05.app.n8n.cloud`). None are wired up yet — this
documents the steps so they're ready to build.

## Workflow 1: "StylecraftReach — Daily stats sync"

**Trigger:** Schedule node — every day at 5:00 AM.

1. **HTTP Request** — `GET` the app's affiliate links. Either call Supabase's REST API directly
   (`{SUPABASE_URL}/rest/v1/affiliate_links`, header `apikey`/`Authorization: Bearer` with the
   service role key), or add a small internal `GET /api/links` route if you'd rather not put the
   service role key in n8n.
2. **Split In Batches / Loop** — iterate each affiliate link.
3. **HTTP Request** — call the app's existing sync endpoint instead of re-implementing the Dub.co
   call in n8n: `POST {APP_URL}/api/links/sync`. This single call already re-fetches every link's
   analytics from Dub.co and updates `affiliate_links` (clicks, conversions, revenue,
   `last_synced_at`) — n8n's job here is just to trigger it on a schedule and check the response.
4. **Supabase node (Upsert)** — write today's `daily_stats` row per `campaign_influencer_id` from
   the synced totals (`unique(campaign_influencer_id, date)` makes this an upsert).
5. **IF node** — for each link, check `clicks > 100` (today) or a new conversion appeared since the
   last run.
6. **Slack / WhatsApp node** — post an alert for anything that tripped the threshold in step 5.

## Workflow 2: "StylecraftReach — Conversion alert" (instant)

**Trigger:** Supabase node, "On Insert" trigger on the `conversions` table (or a Postgres
`LISTEN/NOTIFY` trigger if you're not using n8n's native Supabase trigger).

1. **Supabase node (Select)** — fetch the inserted conversion's `campaign_influencer_id`, joined to
   `influencers` (handle) and `campaigns` (name) — the same shape the app's
   `app/api/webhooks/conversion/route.ts` already POSTs to `N8N_CONVERSION_WEBHOOK_URL` when a
   conversion fires, so this step may be unnecessary if you drive workflow 2 from that webhook
   instead of a separate Supabase trigger — pick one, not both.
2. **Twilio node** — send a WhatsApp message:
   > New conversion! @markthebarbr just drove a $52 sale via MARK15 on the GAMMA+ Launch campaign.

### Wiring it to the app

Set `N8N_CONVERSION_WEBHOOK_URL` in the app's environment variables to workflow 2's n8n webhook
URL. The app's conversion webhook (`app/api/webhooks/conversion/route.ts`) already POSTs
`{ influencerHandle, orderAmount, promoCode, campaignName }` to that URL whenever a conversion is
recorded — it no-ops (doesn't error) if the env var is unset, so this is safe to leave disconnected
until workflow 2 exists.

## Workflow 3: "StylecraftReach — Payment sent alert"

**Trigger:** Webhook (POST from the app's payout flow on success).

**Body received:**
```json
{
  "influencerHandle": "@markthebarbr",
  "influencerEmail": "mark@example.com",
  "amount": 738.40,
  "campaignName": "GAMMA+ Launch",
  "invoiceUrl": "https://...",
  "paymentType": "commission"
}
```

1. **Resend node (or HTTP Request to the Resend API)** — email the influencer:
   > Subject: "Your payment from StylecraftUS is on the way"
   > Body: "Hi {name}, ${amount} has been sent for your {campaignName} commissions. [Download invoice]({invoiceUrl})"
2. **Twilio node** — WhatsApp the Stylecraft team:
   > "Payment sent: ${amount} to {influencerHandle} for {campaignName}"

### Wiring it to the app

Set `N8N_PAYMENT_WEBHOOK_URL` to workflow 3's n8n webhook URL. `lib/payments-send.ts` POSTs the
body above to that URL right after a transfer completes (mock or real) and an invoice is
generated — it no-ops if the env var is unset, same pattern as workflow 2's wiring. Resend itself
isn't installed in this project (no `RESEND_API_KEY`, no SDK) — email sending for now is either
this n8n workflow, or the plain `mailto:` link on `/payments/[influencerId]`'s onboarding banner.

## Workflows 4–7: Portal notifications

All four share **one webhook** (`N8N_PORTAL_WEBHOOK_URL`) — `lib/portal-notify.ts` POSTs
`{ type, ...payload }` to it for every event below, so build one n8n workflow with a **Switch
node** on `{{$json.type}}` routing to the four branches, rather than four separate webhook URLs
(the brief's own "no new API keys needed" note is honored this way).

### 4. Content approved → notify influencer
- `type: "content_approved"`, payload: `{ influencerHandle, influencerEmail, campaignName }`
- Triggered by: `app/api/content-approvals/approve/route.ts`
- Send email via Resend: "Your content was approved!"
- Send WhatsApp if the influencer enabled it (`influencer_notifications.whatsapp_enabled`):
  "Your submission for {campaignName} was approved by StylecraftUS"

### 5. Content needs revision → notify influencer
- `type: "content_needs_revision"`, payload: `{ influencerHandle, influencerEmail, campaignName, feedback }`
- Triggered by: `app/api/content-approvals/request-changes/route.ts`
- Send email with the feedback text: "Feedback on your submission: {feedback}"

### 6. New deliverable added → notify influencer
- Not currently triggered by app code (the brief calls for a Supabase `deliverables` INSERT
  trigger) — the cleanest way to wire this without adding another webhook call site is an **n8n
  native Supabase trigger** on `deliverables` INSERT, rather than `type: "new_deliverable"` on the
  shared webhook.
- Send email: "New deliverable added to {campaign}: {description} — due {due_date}"

### 7. New portal message → notify recipient
- `type: "new_message"`, payload: `{ senderRole, senderName, influencerHandle, influencerEmail, campaignName, content }`
- Triggered by: `app/api/portal/messages/route.ts` (both directions — influencer→brand and brand→influencer)
- **Switch on `senderRole`:** `brand` → email the influencer ("New message from StylecraftUS");
  `influencer` → email the brand team ("New message from {influencerHandle}") — the brand team's
  destination address isn't stored anywhere in this app, so hardcode it in the n8n node.

### Wiring it to the app

Set `N8N_PORTAL_WEBHOOK_URL` to this workflow's n8n webhook URL. It no-ops (doesn't error) if
unset, same pattern as every other webhook in this app.

## Workflows 8–12: Content intelligence (Phase 6)

Unlike the earlier phases, these five are n8n **schedules that call into the app** — n8n owns the
timer, and each workflow's only job is an HTTP Request node hitting the URL below with header
`x-cron-secret: {CRON_SECRET}`. Three of the five routes also call *out* to their own
`N8N_*_WEBHOOK` env var mid-run for an instant alert — those are separate n8n workflows with a
plain Webhook trigger, distinct from the schedule that calls the route.

### 8. Story capture — every 6 hours
- **n8n:** Schedule (every 6h) → HTTP Request `POST {APP_URL}/api/cron/capture-stories`
- Captures new Instagram/TikTok/YouTube stories for every `Active`-stage influencer, running
  Claude sentiment on each (mock fallback without `ANTHROPIC_API_KEY`, same as Phase 2's scoring).
- If a captured story expires in under 6 hours, the route itself POSTs to
  `N8N_STORY_CAPTURE_WEBHOOK` — build a small workflow there with a Webhook trigger → Slack/WhatsApp
  node: "Story expiring soon: {influencerHandle} — {postUrl}".

### 9. Post capture — daily at 3:00 AM
- **n8n:** Schedule (daily 3am) → HTTP Request `POST {APP_URL}/api/cron/capture-posts`
- Captures the last 10 posts for every tracked influencer (any stage), sentiment-analyzes each,
  and flags competitor-hashtag usage into `competitor_overlap`.
- When a new competitor overlap is detected, POSTs to `N8N_POST_CAPTURE_WEBHOOK` — Webhook trigger
  → Slack/WhatsApp: "{influencerHandle} posted competitor content ({competitorBrand})".

### 10. Mention monitoring — every 12 hours
- **n8n:** Schedule (every 12h) → HTTP Request `POST {APP_URL}/api/cron/check-mentions`
- Searches mock (or, once wired up, real Modash) mentions for the tracked keywords, inserts new
  ones into `brand_mentions` with sentiment.
- High-reach mentions (>50K followers) POST to `N8N_MENTION_CHECK_WEBHOOK` immediately — Webhook
  trigger → WhatsApp: "High-reach mention: {authorHandle} ({authorFollowers} followers) — {postUrl}".

### 11. Hashtag sync — daily at 4:00 AM
- **n8n:** Schedule (daily 4am) → HTTP Request `POST {APP_URL}/api/cron/sync-hashtags`
- Refreshes `post_count` / `total_reach` / `avg_engagement` for every row in `tracked_hashtags`
  (own brands + competitors) from mock/real Modash hashtag analytics.

### 12. Weekly digest — Monday 6:00 AM (generate) + 8:00 AM (send)
- **n8n:** Schedule (Monday 6am) → HTTP Request `POST {APP_URL}/api/cron/generate-digest`
- Aggregates the past 7 days across all Phase 6 tables, generates the headline/summary/actions
  with Claude (mock fallback templates the same fields from the real aggregated numbers when
  `ANTHROPIC_API_KEY` is unset), renders the HTML email, and upserts `intelligence_digests`.
- On success, POSTs `{ digestId, headline, emailHtml, recipients }` to
  `N8N_DIGEST_GENERATE_WEBHOOK` — build a second n8n workflow (Schedule, Monday 8am, or a Webhook
  trigger reading the same payload) with a **Resend node** sending `emailHtml` to
  `DIGEST_EMAIL_RECIPIENTS`. Resend isn't installed in this project (same note as every earlier
  phase) — this is the one place email sending is fully n8n's responsibility, not a fallback.
- The "Send digest email" button on `/intelligence` does the same hand-off manually (marks
  `sent_at`, re-fires the same webhook) for on-demand sends outside the Monday schedule.
