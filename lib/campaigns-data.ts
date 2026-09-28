import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { CampaignInfluencer, Influencer } from "@/lib/types";
import type { CampaignSummary } from "@/lib/campaign-detail-types";

export interface InvitationRow extends CampaignInfluencer {
  influencer: Influencer;
  contentCount: number;
  clicks: number;
  emv: number;
}

export async function getCampaignSummary(campaignId: string): Promise<CampaignSummary | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_summary")
    .select("*")
    .eq("campaign_id", campaignId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getInvitationRows(campaignId: string): Promise<InvitationRow[]> {
  const supabase = createServerClient();
  const { data: rows, error } = await supabase
    .from("campaign_influencers")
    .select("*, influencer:influencers(*)")
    .eq("campaign_id", campaignId)
    .order("stage_updated_at", { ascending: false });
  if (error) throw error;

  const ciIds = (rows ?? []).map((r) => r.id);
  if (ciIds.length === 0) return [];

  const [{ data: content, error: contentError }, { data: links, error: linksError }] = await Promise.all([
    supabase.from("captured_content").select("campaign_influencer_id, emv").in("campaign_influencer_id", ciIds),
    supabase.from("affiliate_links").select("campaign_influencer_id, clicks").in("campaign_influencer_id", ciIds),
  ]);
  if (contentError) throw contentError;
  if (linksError) throw linksError;

  const contentCountByCi = new Map<string, number>();
  const emvByCi = new Map<string, number>();
  for (const c of content ?? []) {
    contentCountByCi.set(c.campaign_influencer_id, (contentCountByCi.get(c.campaign_influencer_id) ?? 0) + 1);
    emvByCi.set(c.campaign_influencer_id, (emvByCi.get(c.campaign_influencer_id) ?? 0) + (c.emv ?? 0));
  }
  const clicksByCi = new Map<string, number>();
  for (const l of links ?? []) {
    clicksByCi.set(l.campaign_influencer_id, (clicksByCi.get(l.campaign_influencer_id) ?? 0) + (l.clicks ?? 0));
  }

  return (rows ?? []).map((r) => ({
    ...r,
    contentCount: contentCountByCi.get(r.id) ?? 0,
    clicks: clicksByCi.get(r.id) ?? 0,
    emv: emvByCi.get(r.id) ?? 0,
  })) as never;
}
