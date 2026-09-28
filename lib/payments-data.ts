import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getAllCampaignInfluencers } from "@/lib/data";
import type {
  Campaign,
  CampaignInfluencer,
  Influencer,
  Invoice,
  Payment,
  PaymentSchedule,
} from "@/lib/types";

export interface PaymentFull extends Payment {
  campaign_influencer: CampaignInfluencer & { influencer: Influencer; campaign: Campaign };
  invoice: { pdf_url: string | null; invoice_number: string } | null;
}

export interface InvoiceFull extends Invoice {
  influencer: Influencer;
  campaign: Campaign;
}

export interface OutstandingRow {
  campaignInfluencerId: string;
  influencer: Influencer;
  campaign: Campaign;
  type: "commission" | "flat_fee";
  amount: number;
  periodStart: string | null;
  periodEnd: string | null;
  pendingPaymentId: string | null;
}

export async function getOutstandingRows(): Promise<OutstandingRow[]> {
  const supabase = createServerClient();
  const [campaignInfluencers, { data: conversions, error: convError }, { data: pendingPayments, error: payError }] =
    await Promise.all([
      getAllCampaignInfluencers(),
      supabase
        .from("conversions")
        .select("campaign_influencer_id, commission_amount, created_at")
        .eq("commission_paid", false),
      supabase.from("payments").select("*").eq("status", "pending"),
    ]);
  if (convError) throw convError;
  if (payError) throw payError;

  const ciById = new Map(campaignInfluencers.map((ci) => [ci.id, ci]));
  const rows: OutstandingRow[] = [];

  const commissionByCI = new Map<string, { amount: number; earliest: string; latest: string }>();
  for (const c of conversions ?? []) {
    const agg = commissionByCI.get(c.campaign_influencer_id) ?? {
      amount: 0,
      earliest: c.created_at,
      latest: c.created_at,
    };
    agg.amount += Number(c.commission_amount);
    if (c.created_at < agg.earliest) agg.earliest = c.created_at;
    if (c.created_at > agg.latest) agg.latest = c.created_at;
    commissionByCI.set(c.campaign_influencer_id, agg);
  }

  for (const [ciId, agg] of Array.from(commissionByCI.entries())) {
    const ci = ciById.get(ciId);
    if (!ci) continue;
    rows.push({
      campaignInfluencerId: ciId,
      influencer: ci.influencer,
      campaign: ci.campaign,
      type: "commission",
      amount: agg.amount,
      periodStart: agg.earliest,
      periodEnd: agg.latest,
      pendingPaymentId: null,
    });
  }

  for (const p of pendingPayments ?? []) {
    const ci = ciById.get(p.campaign_influencer_id);
    if (!ci) continue;
    rows.push({
      campaignInfluencerId: p.campaign_influencer_id,
      influencer: ci.influencer,
      campaign: ci.campaign,
      type: p.payment_type === "commission" ? "commission" : "flat_fee",
      amount: Number(p.amount),
      periodStart: p.period_start,
      periodEnd: p.period_end,
      pendingPaymentId: p.id,
    });
  }

  return rows;
}

export async function getPaymentHistory(): Promise<PaymentFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, campaign_influencer:campaign_influencers(*, influencer:influencers(*), campaign:campaigns(*)), invoice:invoices!invoices_payment_id_fkey(pdf_url, invoice_number)"
    )
    .in("status", ["paid", "processing", "failed", "cancelled"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getPaymentsForCampaignInfluencer(
  campaignInfluencerId: string
): Promise<Payment[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getScheduleForCampaignInfluencer(
  campaignInfluencerId: string
): Promise<PaymentSchedule[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("payment_schedule")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("scheduled_date", { ascending: true });
  if (error) throw error;
  return data as never;
}

export async function getInvoiceForPayment(paymentId: string): Promise<Invoice | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getInvoices(): Promise<InvoiceFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, influencer:influencers(*), campaign:campaigns(*)")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getNextInvoiceNumber(): Promise<string> {
  const supabase = createServerClient();
  const year = new Date().getFullYear();
  const prefix = `SCR-${year}-`;

  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);
  if (error) throw error;

  const last = data?.[0]?.invoice_number;
  const lastSeq = last ? parseInt(last.replace(prefix, ""), 10) : 0;
  const nextSeq = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function getMonthlyPaidTotal(): Promise<number> {
  const supabase = createServerClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("payments")
    .select("amount")
    .eq("status", "paid")
    .gte("paid_at", startOfMonth.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((s, p) => s + Number(p.amount), 0);
}

export async function getProcessingCount(): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "processing");
  if (error) throw error;
  return count ?? 0;
}

export async function getNotOnboardedActiveCount(): Promise<number> {
  const campaignInfluencers = await getAllCampaignInfluencers();
  const activeCampaignInfluencerIds = new Set(
    campaignInfluencers.filter((ci) => ci.campaign.status === "active").map((ci) => ci.influencer.id)
  );
  const supabase = createServerClient();
  const { data, error } = await supabase.from("influencers").select("id, stripe_onboarded");
  if (error) throw error;
  return (data ?? []).filter((i) => activeCampaignInfluencerIds.has(i.id) && !i.stripe_onboarded).length;
}
