import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { trackSale } from "@/lib/dub/client";

interface ConversionWebhookBody {
  orderId: string;
  orderAmount: number;
  promoCode: string;
  customerId?: string;
}

function isValidShopifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expected = Buffer.from(digest);
  const actual = Buffer.from(header);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (secret) {
    const signature = req.headers.get("x-shopify-hmac-sha256");
    if (!isValidShopifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const { orderId, orderAmount, promoCode, customerId } = JSON.parse(rawBody) as ConversionWebhookBody;

  if (!orderId || !orderAmount || !promoCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: promoData } = await supabase
    .from("promo_codes")
    .select("*, campaign_influencers(*, influencer:influencers(*), campaign:campaigns(*))")
    .eq("code", promoCode)
    .maybeSingle();

  if (!promoData) {
    return NextResponse.json({ received: true, matched: false });
  }

  const campaignInfluencer = promoData.campaign_influencers;
  const commissionAmount = orderAmount * (promoData.commission_rate / 100);

  const { data: affiliateLink } = await supabase
    .from("affiliate_links")
    .select("id")
    .eq("campaign_influencer_id", campaignInfluencer.id)
    .maybeSingle();

  await trackSale({
    externalId: campaignInfluencer.id,
    amount: Math.round(orderAmount * 100),
    currency: "usd",
    paymentProcessor: "shopify",
    invoiceId: orderId,
  }).catch(() => {});

  const { error: insertError } = await supabase.from("conversions").insert({
    campaign_influencer_id: campaignInfluencer.id,
    promo_code_id: promoData.id,
    affiliate_link_id: affiliateLink?.id ?? null,
    order_id: orderId,
    order_amount: orderAmount,
    commission_amount: commissionAmount,
    customer_id: customerId ?? null,
    source: affiliateLink ? "both" : "promo_code",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase
    .from("promo_codes")
    .update({ usage_count: promoData.usage_count + 1 })
    .eq("id", promoData.id);

  if (process.env.N8N_CONVERSION_WEBHOOK_URL) {
    fetch(process.env.N8N_CONVERSION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        influencerHandle: campaignInfluencer.influencer.handle,
        orderAmount,
        promoCode,
        campaignName: campaignInfluencer.campaign.name,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ received: true, matched: true });
}
