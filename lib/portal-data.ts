import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignInfluencer,
  ContentSubmission,
  Deliverable,
  Gift,
  Influencer,
  InfluencerNotificationPrefs,
  PortalMessage,
} from "@/lib/types";

export async function getPortalInfluencer(): Promise<Influencer | null> {
  const { userId } = auth();
  if (!userId) return null;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("influencers")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface DeliverableWithSubmissions extends Deliverable {
  content_submissions: ContentSubmission[];
}

export interface PortalCampaignRow extends CampaignInfluencer {
  campaign: Campaign;
  deliverables: DeliverableWithSubmissions[];
  gifts: Gift[];
}

// Every read here is scoped to influencerId (resolved from the signed-in
// Clerk user via getPortalInfluencer) — this is the application-layer
// isolation described in supabase/migrations/008_phase5_portal.sql, since
// this app's Supabase client always uses the service-role key and never
// establishes a Supabase Auth session for RLS's auth.uid() to key off of.
export async function getPortalCampaigns(influencerId: string): Promise<PortalCampaignRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select("*, campaign:campaigns(*), deliverables(*, content_submissions(*)), gifts(*)")
    .eq("influencer_id", influencerId)
    .order("stage_updated_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getPortalCampaignDetail(
  campaignInfluencerId: string,
  influencerId: string
): Promise<PortalCampaignRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select("*, campaign:campaigns(*), deliverables(*, content_submissions(*)), gifts(*)")
    .eq("id", campaignInfluencerId)
    .eq("influencer_id", influencerId)
    .maybeSingle();
  if (error) throw error;
  return data as never;
}

export async function getPortalMessages(campaignInfluencerId: string): Promise<PortalMessage[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portal_messages")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as never;
}

export interface PortalEarningsSummary {
  totalEarned: number;
  paidOut: number;
  pending: number;
  thisMonth: number;
}

export interface EarningsByCampaign {
  campaign: Campaign;
  campaignInfluencerId: string;
  flatFee: number;
  commission: number;
  total: number;
  status: "paid" | "partially_paid" | "unpaid";
}

export interface PortalPayoutRow {
  id: string;
  date: string;
  amount: number;
  type: string;
  campaignName: string;
  status: string;
  invoicePdfUrl: string | null;
}

export async function getPortalEarnings(influencerId: string): Promise<{
  summary: PortalEarningsSummary;
  byCampaign: EarningsByCampaign[];
  payoutHistory: PortalPayoutRow[];
}> {
  const supabase = createServerClient();

  const { data: ciRows, error: ciError } = await supabase
    .from("campaign_influencers")
    .select("id, campaign:campaigns(*)")
    .eq("influencer_id", influencerId);
  if (ciError) throw ciError;
  const campaignInfluencers = ciRows as unknown as { id: string; campaign: Campaign }[] | null;

  const ciIds = (campaignInfluencers ?? []).map((ci) => ci.id);
  if (ciIds.length === 0) {
    return {
      summary: { totalEarned: 0, paidOut: 0, pending: 0, thisMonth: 0 },
      byCampaign: [],
      payoutHistory: [],
    };
  }

  const [{ data: payments, error: payError }, { data: conversions, error: convError }] = await Promise.all([
    supabase
      .from("payments")
      .select("*, invoice:invoices!invoices_payment_id_fkey(pdf_url)")
      .in("campaign_influencer_id", ciIds),
    supabase
      .from("conversions")
      .select("campaign_influencer_id, commission_amount, commission_paid")
      .in("campaign_influencer_id", ciIds),
  ]);
  if (payError) throw payError;
  if (convError) throw convError;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let totalEarned = 0;
  let paidOut = 0;
  let pending = 0;
  let thisMonth = 0;

  const byCI = new Map<string, { flatFee: number; commission: number; hasPending: boolean; hasPaid: boolean }>();
  for (const ci of campaignInfluencers ?? []) {
    byCI.set(ci.id, { flatFee: 0, commission: 0, hasPending: false, hasPaid: false });
  }

  const payoutHistory: PortalPayoutRow[] = [];

  for (const p of payments ?? []) {
    const amount = Number(p.amount);
    const agg = byCI.get(p.campaign_influencer_id);
    if (agg) {
      if (p.payment_type === "flat_fee" || p.payment_type === "bonus") agg.flatFee += amount;
      else agg.commission += amount;
      if (p.status === "paid") agg.hasPaid = true;
      if (p.status === "pending" || p.status === "processing") agg.hasPending = true;
    }
    if (p.status === "paid") {
      totalEarned += amount;
      paidOut += amount;
      if (p.paid_at && new Date(p.paid_at) >= startOfMonth) thisMonth += amount;
      payoutHistory.push({
        id: p.id,
        date: p.paid_at ?? p.created_at,
        amount,
        type: p.payment_type,
        campaignName:
          (campaignInfluencers ?? []).find((ci) => ci.id === p.campaign_influencer_id)?.campaign?.name ?? "—",
        status: p.status,
        invoicePdfUrl: p.invoice?.pdf_url ?? null,
      });
    } else if (p.status === "pending" || p.status === "processing") {
      pending += amount;
      totalEarned += amount;
    }
  }

  for (const c of conversions ?? []) {
    if (c.commission_paid) continue;
    const amount = Number(c.commission_amount);
    pending += amount;
    totalEarned += amount;
    const agg = byCI.get(c.campaign_influencer_id);
    if (agg) {
      agg.commission += amount;
      agg.hasPending = true;
    }
  }

  const byCampaign: EarningsByCampaign[] = (campaignInfluencers ?? []).map((ci) => {
    const agg = byCI.get(ci.id) ?? { flatFee: 0, commission: 0, hasPending: false, hasPaid: false };
    const status: EarningsByCampaign["status"] = agg.hasPending
      ? agg.hasPaid
        ? "partially_paid"
        : "unpaid"
      : "paid";
    return {
      campaign: ci.campaign,
      campaignInfluencerId: ci.id,
      flatFee: agg.flatFee,
      commission: agg.commission,
      total: agg.flatFee + agg.commission,
      status,
    };
  });

  payoutHistory.sort((a, b) => b.date.localeCompare(a.date));

  return {
    summary: { totalEarned, paidOut, pending, thisMonth },
    byCampaign,
    payoutHistory,
  };
}

export interface SubmissionForReview extends ContentSubmission {
  deliverable: { description: string };
  campaign_influencer: { influencer: Influencer; campaign: Campaign };
}

export async function getPendingSubmissionsCount(): Promise<number> {
  const supabase = createServerClient();
  const { count, error } = await supabase
    .from("content_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_review");
  if (error) throw error;
  return count ?? 0;
}

export async function getPendingSubmissions(): Promise<SubmissionForReview[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("content_submissions")
    .select(
      "*, deliverable:deliverables(description), campaign_influencer:campaign_influencers(influencer:influencers(*), campaign:campaigns(*))"
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as never;
}

export async function getNotificationPrefs(
  influencerId: string
): Promise<InfluencerNotificationPrefs | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("influencer_notifications")
    .select("*")
    .eq("influencer_id", influencerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
