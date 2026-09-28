import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Campaign, Influencer } from "@/lib/types";
import type { BrandMention, CapturedContent, CompetitorOverlap, IntelligenceDigest, RiskLevel } from "@/lib/intelligence-types";

export interface CapturedContentFull extends CapturedContent {
  influencer: Influencer;
  campaign: Campaign | null;
}

export interface ContentFilters {
  mediaType?: string;
  platform?: string;
  campaignId?: string;
  sentiment?: string;
  featuredOnly?: boolean;
  sort?: "newest" | "views" | "sentiment";
}

export async function getCapturedContent(filters: ContentFilters = {}): Promise<CapturedContentFull[]> {
  const supabase = createServerClient();
  let query = supabase
    .from("captured_content")
    .select("*, influencer:influencers(*), campaign_influencer:campaign_influencers(campaign:campaigns(*))");

  if (filters.mediaType) query = query.eq("media_type", filters.mediaType);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.sentiment) query = query.eq("overall_sentiment", filters.sentiment);
  if (filters.featuredOnly) query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []).map((row) => {
    const r = row as unknown as CapturedContentFull & {
      campaign_influencer: { campaign: Campaign } | null;
    };
    return { ...r, campaign: r.campaign_influencer?.campaign ?? null };
  });

  if (filters.campaignId) rows = rows.filter((r) => r.campaign?.id === filters.campaignId);

  if (filters.sort === "views") rows.sort((a, b) => b.views - a.views);
  else if (filters.sort === "sentiment")
    rows.sort((a, b) => (b.sentiment_score ?? -Infinity) - (a.sentiment_score ?? -Infinity));
  else rows.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));

  return rows;
}

export async function getExpiringStories(hoursThreshold = 6): Promise<CapturedContentFull[]> {
  const all = await getCapturedContent();
  const cutoff = Date.now() + hoursThreshold * 60 * 60 * 1000;
  return all.filter((c) => c.is_story && c.expires_at && new Date(c.expires_at).getTime() < cutoff);
}

export interface MentionFilters {
  tab?: "all" | "high_reach" | "unactioned" | "saved";
}

export async function getMentions(filters: MentionFilters = {}): Promise<BrandMention[]> {
  const supabase = createServerClient();
  let query = supabase.from("brand_mentions").select("*").order("posted_at", { ascending: false });

  if (filters.tab === "high_reach") query = query.gte("author_followers", 10000);
  if (filters.tab === "unactioned") query = query.eq("actioned", false);
  if (filters.tab === "saved") query = query.eq("saved", true);

  const { data, error } = await query;
  if (error) throw error;
  return data as never;
}

export async function getMentionKeywordCounts(): Promise<{ keyword: string; count: number }[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("brand_mentions").select("matched_keyword");
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.matched_keyword) continue;
    counts.set(row.matched_keyword, (counts.get(row.matched_keyword) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

export interface CompetitorOverlapRow extends CompetitorOverlap {
  influencer: Influencer;
  risk: RiskLevel;
  hasActiveCampaign: boolean;
  ourCampaignName: string | null;
}

export async function getCompetitorOverlapRows(): Promise<CompetitorOverlapRow[]> {
  const supabase = createServerClient();
  const [{ data: overlaps, error: overlapError }, { data: activeCIs, error: ciError }] = await Promise.all([
    supabase.from("competitor_overlap").select("*, influencer:influencers(*)").order("detected_at", { ascending: false }),
    supabase
      .from("campaign_influencers")
      .select("influencer_id, stage, campaign:campaigns(name)")
      .eq("stage", "Active"),
  ]);
  if (overlapError) throw overlapError;
  if (ciError) throw ciError;

  const activeByInfluencer = new Map((activeCIs ?? []).map((ci) => [ci.influencer_id, ci.campaign as unknown as Campaign]));

  return (overlaps ?? []).map((row) => {
    const r = row as unknown as CompetitorOverlap & { influencer: Influencer };
    const activeCampaign = activeByInfluencer.get(r.influencer_id);
    const hasActiveCampaign = Boolean(activeCampaign);
    const daysSinceDetected = (Date.now() - new Date(r.detected_at).getTime()) / (1000 * 60 * 60 * 24);

    let risk: RiskLevel = "Low";
    if (hasActiveCampaign && r.evidence_type === "paid_partnership") risk = "High";
    else if (daysSinceDetected < 60) risk = "Medium";

    return {
      ...r,
      risk,
      hasActiveCampaign,
      ourCampaignName: activeCampaign?.name ?? null,
    };
  });
}

export async function getCompetitorSummary(): Promise<{ brand: string; count: number }[]> {
  const rows = await getCompetitorOverlapRows();
  const counts = new Map<string, Set<string>>();
  for (const r of rows) {
    const set = counts.get(r.competitor_brand) ?? new Set<string>();
    set.add(r.influencer_id);
    counts.set(r.competitor_brand, set);
  }
  return Array.from(counts.entries())
    .map(([brand, set]) => ({ brand, count: set.size }))
    .sort((a, b) => b.count - a.count);
}

export async function getHashtagComparison() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tracked_hashtags")
    .select("*")
    .order("post_count", { ascending: false });
  if (error) throw error;
  return data as never as import("@/lib/intelligence-types").TrackedHashtag[];
}

export async function getDigests(): Promise<IntelligenceDigest[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("intelligence_digests")
    .select("*")
    .order("week_start", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getDigestById(id: string): Promise<IntelligenceDigest | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("intelligence_digests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
