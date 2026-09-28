import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { createTransfer } from "@/lib/stripe/client";
import { createInvoiceForPayment } from "@/lib/invoice-generation";
import type { Payment, PaymentType } from "@/lib/types";

export interface SendPayoutInput {
  campaignInfluencerId: string;
  paymentType: PaymentType;
  paymentId?: string; // an existing pending flat_fee/bonus payment row to pay
}

export interface SendPayoutResult {
  success: boolean;
  payment?: Payment;
  invoiceUrl?: string;
  handle?: string;
  error?: string;
}

// Never trusts a client-supplied dollar amount — always derives it from a
// stored pending payment row or freshly summed unpaid conversions, since this
// function moves real money via Stripe transfers.
export async function sendPayout(input: SendPayoutInput): Promise<SendPayoutResult> {
  const supabase = createServerClient();

  const { data: ci, error: ciError } = await supabase
    .from("campaign_influencers")
    .select("*, influencer:influencers(*), campaign:campaigns(*)")
    .eq("id", input.campaignInfluencerId)
    .single();

  if (ciError || !ci) return { success: false, error: "Campaign influencer not found" };

  if (!ci.influencer.stripe_onboarded || !ci.influencer.stripe_account_id) {
    return { success: false, error: `${ci.influencer.handle} hasn't connected their bank account yet` };
  }

  let amount: number;
  let description: string;
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  let paymentRowId: string;

  if (input.paymentId) {
    const { data: existing, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", input.paymentId)
      .eq("status", "pending")
      .single();
    if (error || !existing) return { success: false, error: "Payment not found or already processed" };
    amount = Number(existing.amount);
    description = existing.description ?? `${ci.campaign.name} payment`;
    periodStart = existing.period_start;
    periodEnd = existing.period_end;
    paymentRowId = existing.id;
  } else if (input.paymentType === "commission") {
    const { data: unpaid, error } = await supabase
      .from("conversions")
      .select("commission_amount, created_at")
      .eq("campaign_influencer_id", input.campaignInfluencerId)
      .eq("commission_paid", false);
    if (error) return { success: false, error: error.message };

    const sum = (unpaid ?? []).reduce((s, c) => s + Number(c.commission_amount), 0);
    if (sum <= 0) return { success: false, error: "No outstanding commission for this influencer" };

    const dates = (unpaid ?? []).map((c) => c.created_at).sort();
    amount = sum;
    description = `${ci.campaign.name} — commission payment`;
    periodStart = dates[0] ?? null;
    periodEnd = dates[dates.length - 1] ?? null;

    const { data: inserted, error: insertError } = await supabase
      .from("payments")
      .insert({
        campaign_influencer_id: input.campaignInfluencerId,
        payment_type: "commission",
        amount,
        status: "pending",
        description,
        period_start: periodStart,
        period_end: periodEnd,
      })
      .select()
      .single();
    if (insertError) return { success: false, error: insertError.message };
    paymentRowId = inserted.id;
  } else {
    return { success: false, error: "No payment specified" };
  }

  await supabase
    .from("payments")
    .update({ status: "processing", stripe_account_id: ci.influencer.stripe_account_id })
    .eq("id", paymentRowId);

  const transfer = await createTransfer({
    amountCents: Math.round(amount * 100),
    destinationAccountId: ci.influencer.stripe_account_id,
    description,
    metadata: {
      influencer_id: ci.influencer.id,
      campaign_id: ci.campaign.id,
      payment_id: paymentRowId,
    },
  });

  const { data: updatedPayment, error: updateError } = await supabase
    .from("payments")
    .update({
      status: transfer.status,
      stripe_transfer_id: transfer.transferId,
      paid_at: transfer.status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", paymentRowId)
    .select()
    .single();

  if (updateError) return { success: false, error: updateError.message };

  if (input.paymentType === "commission" && !input.paymentId) {
    await supabase
      .from("conversions")
      .update({ commission_paid: true })
      .eq("campaign_influencer_id", input.campaignInfluencerId)
      .eq("commission_paid", false);
  }

  let invoiceUrl: string | undefined;
  try {
    const invoice = await createInvoiceForPayment(paymentRowId);
    invoiceUrl = invoice.pdfUrl;
  } catch {
    // Invoice generation failing shouldn't roll back an already-completed transfer.
  }

  if (process.env.N8N_PAYMENT_WEBHOOK_URL) {
    fetch(process.env.N8N_PAYMENT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        influencerHandle: ci.influencer.handle,
        influencerEmail: ci.influencer.email,
        amount,
        campaignName: ci.campaign.name,
        invoiceUrl,
        paymentType: input.paymentType,
      }),
    }).catch(() => {});
  }

  return { success: true, payment: updatedPayment, invoiceUrl, handle: ci.influencer.handle };
}
