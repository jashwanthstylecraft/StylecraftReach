# n8n workflows

Three workflows to build in n8n (`josepho05.app.n8n.cloud`). None are wired up yet — this
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
