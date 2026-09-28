import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { getAllCampaignInfluencers } from "@/lib/data";
import type {
  AffiliateLink,
  AnalyticsSummary,
  Conversion,
  DailyStat,
  Influencer,
  InfluencerPerformanceRow,
  PromoCode,
  Campaign,
  CampaignInfluencer,
} from "@/lib/types";

export interface AnalyticsFilters {
  days: number;
  campaignId?: string;
  brand?: string;
}

export interface AffiliateLinkFull extends AffiliateLink {
  campaign_influencer: CampaignInfluencer & { influencer: Influencer; campaign: Campaign };
}

export interface PromoCodeFull extends PromoCode {
  campaign_influencer: CampaignInfluencer & { influencer: Influencer; campaign: Campaign };
}

async function getDailyStatsInRange(days: number): Promise<DailyStat[]> {
  const supabase = createServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as never;
}

async function getAffiliateLinksRaw(): Promise<AffiliateLink[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("affiliate_links").select("*");
  if (error) throw error;
  return data as never;
}

export async function getAffiliateLinksFull(): Promise<AffiliateLinkFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*, campaign_influencer:campaign_influencers(*, influencer:influencers(*), campaign:campaigns(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getPromoCodesFull(): Promise<PromoCodeFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*, campaign_influencer:campaign_influencers(*, influencer:influencers(*), campaign:campaigns(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getPromoCodeRevenueMap(): Promise<Map<string, number>> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("conversions").select("promo_code_id, order_amount");
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of data) {
    if (!row.promo_code_id) continue;
    map.set(row.promo_code_id, (map.get(row.promo_code_id) ?? 0) + Number(row.order_amount));
  }
  return map;
}

export async function getConversionsForCampaignInfluencer(
  campaignInfluencerId: string
): Promise<Conversion[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("conversions")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export interface ConversionWithPromoCode extends Conversion {
  promo_code: { code: string } | null;
}

export async function getConversionsWithPromoCode(
  campaignInfluencerId: string
): Promise<ConversionWithPromoCode[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("conversions")
    .select("*, promo_code:promo_codes(code)")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getAffiliateLinkForCampaignInfluencer(
  campaignInfluencerId: string
): Promise<AffiliateLink | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getDailyStatsForCampaignInfluencer(
  campaignInfluencerId: string,
  days: number
): Promise<DailyStat[]> {
  const supabase = createServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) throw error;
  return data as never;
}

export async function getPerformanceRows(filters: AnalyticsFilters): Promise<InfluencerPerformanceRow[]> {
  const [campaignInfluencers, dailyStats, affiliateLinks] = await Promise.all([
    getAllCampaignInfluencers(),
    getDailyStatsInRange(filters.days),
    getAffiliateLinksRaw(),
  ]);

  const statsByCI = new Map<string, { clicks: number; conversions: number; revenue: number; commission: number }>();
  for (const s of dailyStats) {
    const agg = statsByCI.get(s.campaign_influencer_id) ?? { clicks: 0, conversions: 0, revenue: 0, commission: 0 };
    agg.clicks += s.clicks;
    agg.conversions += s.conversions;
    agg.revenue += Number(s.revenue);
    agg.commission += Number(s.commission_amount);
    statsByCI.set(s.campaign_influencer_id, agg);
  }
  const linkByCI = new Map(affiliateLinks.map((l) => [l.campaign_influencer_id, l]));

  let rows: InfluencerPerformanceRow[] = campaignInfluencers.map((ci) => {
    const agg = statsByCI.get(ci.id) ?? { clicks: 0, conversions: 0, revenue: 0, commission: 0 };
    const link = linkByCI.get(ci.id) ?? null;
    const roi = ci.fee ? agg.revenue / Number(ci.fee) : null;
    return {
      campaignInfluencerId: ci.id,
      influencer: ci.influencer,
      campaign: ci.campaign,
      stage: ci.stage,
      fee: ci.fee,
      affiliateLink: link,
      clicks: agg.clicks,
      conversions: agg.conversions,
      revenue: agg.revenue,
      commission: agg.commission,
      roi,
    };
  });

  if (filters.campaignId) rows = rows.filter((r) => r.campaign.id === filters.campaignId);
  if (filters.brand) rows = rows.filter((r) => r.campaign.brand === filters.brand);

  return rows;
}

export function summarizePerformance(rows: InfluencerPerformanceRow[]): AnalyticsSummary {
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalConversions = rows.reduce((s, r) => s + r.conversions, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCommissions = rows.reduce((s, r) => s + r.commission, 0);

  const campaignSpend = new Map<string, number>();
  rows.forEach((r) => campaignSpend.set(r.campaign.id, Number(r.campaign.spend ?? 0)));
  const totalSpend = Array.from(campaignSpend.values()).reduce((a, b) => a + b, 0);

  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    totalCommissions,
    overallRoi: totalSpend > 0 ? totalRevenue / totalSpend : null,
    avgOrderValue: totalConversions > 0 ? totalRevenue / totalConversions : null,
  };
}

export async function getTimeseries(
  filters: AnalyticsFilters
): Promise<{ date: string; clicks: number; conversions: number; revenue: number }[]> {
  const [dailyStats, campaignInfluencers] = await Promise.all([
    getDailyStatsInRange(filters.days),
    getAllCampaignInfluencers(),
  ]);
  const ciById = new Map(campaignInfluencers.map((ci) => [ci.id, ci]));

  const filtered = dailyStats.filter((s) => {
    const ci = ciById.get(s.campaign_influencer_id);
    if (!ci) return false;
    if (filters.campaignId && ci.campaign.id !== filters.campaignId) return false;
    if (filters.brand && ci.campaign.brand !== filters.brand) return false;
    return true;
  });

  const byDate = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  filtered.forEach((s) => {
    const agg = byDate.get(s.date) ?? { clicks: 0, conversions: 0, revenue: 0 };
    agg.clicks += s.clicks;
    agg.conversions += s.conversions;
    agg.revenue += Number(s.revenue);
    byDate.set(s.date, agg);
  });

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, agg]) => ({ date, ...agg }));
}

export function revenueByInfluencer(rows: InfluencerPerformanceRow[], limit = 10) {
  return [...rows]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((r) => ({
      handle: r.influencer.handle,
      platform: r.influencer.platform,
      revenue: r.revenue,
    }));
}

export function platformSplit(rows: InfluencerPerformanceRow[]) {
  const byPlatform = new Map<string, number>();
  rows.forEach((r) => byPlatform.set(r.influencer.platform, (byPlatform.get(r.influencer.platform) ?? 0) + r.clicks));
  return Array.from(byPlatform.entries()).map(([platform, clicks]) => ({ platform, clicks }));
}

export function conversionRateByCampaign(rows: InfluencerPerformanceRow[]) {
  const byCampaign = new Map<string, { name: string; clicks: number; conversions: number }>();
  rows.forEach((r) => {
    const agg = byCampaign.get(r.campaign.id) ?? { name: r.campaign.name, clicks: 0, conversions: 0 };
    agg.clicks += r.clicks;
    agg.conversions += r.conversions;
    byCampaign.set(r.campaign.id, agg);
  });
  return Array.from(byCampaign.values()).map((c) => ({
    name: c.name,
    rate: c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0,
  }));
}
