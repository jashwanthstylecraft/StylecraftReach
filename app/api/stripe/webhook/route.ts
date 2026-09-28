import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface StripeEventLike {
  type: string;
  data: { object: Record<string, unknown> };
}

async function verifyAndParse(rawBody: string, signature: string | null): Promise<StripeEventLike> {
  if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY) {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-08-26.dahlia" });
    return stripe.webhooks.constructEvent(
      rawBody,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET
    ) as unknown as StripeEventLike;
  }
  return JSON.parse(rawBody) as StripeEventLike;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: StripeEventLike;
  try {
    event = await verifyAndParse(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerClient();

  switch (event.type) {
    case "transfer.paid": {
      const transferId = event.data.object.id as string;
      await supabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("stripe_transfer_id", transferId);
      break;
    }
    case "transfer.failed": {
      const transferId = event.data.object.id as string;
      const failureMessage = (event.data.object.failure_message as string) ?? "Transfer failed";
      await supabase
        .from("payments")
        .update({ status: "failed", failed_reason: failureMessage })
        .eq("stripe_transfer_id", transferId);
      break;
    }
    case "account.updated": {
      const account = event.data.object as {
        id: string;
        charges_enabled?: boolean;
        payouts_enabled?: boolean;
      };
      if (account.payouts_enabled) {
        await supabase
          .from("influencers")
          .update({ stripe_onboarded: true, stripe_onboarded_at: new Date().toISOString() })
          .eq("stripe_account_id", account.id);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
