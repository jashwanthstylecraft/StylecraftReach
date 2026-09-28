import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { DEFAULT_BRANDS, type BrandComparisonRow } from "@/lib/affable-types";

export async function getBrandComparisonRows(): Promise<BrandComparisonRow[]> {
  const supabase = createServerClient();
  const [{ data: hashtags, error }, topInfluencerByBrand] = await Promise.all([
    supabase.from("tracked_hashtags").select("brand, post_count, total_reach, avg_engagement"),
    getTopInfluencerByBrand(),
  ]);
  if (error) throw error;

  return DEFAULT_BRANDS.map((brand) => {
    const rows = (hashtags ?? []).filter((h) => h.brand === brand.name);
    const posts = rows.reduce((sum, r) => sum + (r.post_count ?? 0), 0);
    const totalReach = rows.reduce((sum, r) => sum + (r.total_reach ?? 0), 0);
    const engagementValues = rows.map((r) => r.avg_engagement).filter((v): v is number => v !== null);
    const avgEngagement = engagementValues.length
      ? engagementValues.reduce((sum, v) => sum + v, 0) / engagementValues.length
      : 0;
    // Estimated EMV: no per-brand content-ownership data exists for competitor
    // brands, so this derives from the same reach/engagement aggregates tracked
    // per hashtag rather than a separately fabricated number.
    const totalEmv = totalReach * 0.015 * (1 + avgEngagement / 100);

    return {
      brandId: brand.id,
      brandName: brand.name,
      posts,
      totalReach,
      avgEngagement,
      totalEmv,
      topInfluencer: topInfluencerByBrand.get(brand.name) ?? null,
    };
  });
}

// Own brands: the influencer with the most EMV in captured_content for that brand.
// Competitor brands: no content we captured belongs to them, so this falls back to
// the most frequently flagged influencer in competitor_overlap instead.
async function getTopInfluencerByBrand(): Promise<Map<string, string>> {
  const supabase = createServerClient();
  const result = new Map<string, string>();

  const { data: content, error: contentError } = await supabase
    .from("captured_content")
    .select("emv, campaign_influencer:campaign_influencers(campaign:campaigns(brand), influencer:influencers(handle))");
  if (contentError) throw contentError;

  const emvByBrandHandle = new Map<string, Map<string, number>>();
  for (const row of content ?? []) {
    const r = row as unknown as {
      emv: number | null;
      campaign_influencer: { campaign: { brand: string } | null; influencer: { handle: string } | null } | null;
    };
    const brand = r.campaign_influencer?.campaign?.brand;
    const handle = r.campaign_influencer?.influencer?.handle;
    if (!brand || !handle) continue;
    if (!emvByBrandHandle.has(brand)) emvByBrandHandle.set(brand, new Map());
    const byHandle = emvByBrandHandle.get(brand)!;
    byHandle.set(handle, (byHandle.get(handle) ?? 0) + (r.emv ?? 0));
  }
  Array.from(emvByBrandHandle.entries()).forEach(([brand, byHandle]) => {
    const top = Array.from(byHandle.entries()).sort((a, b) => b[1] - a[1])[0];
    if (top) result.set(brand, top[0]);
  });

  const { data: overlap, error: overlapError } = await supabase
    .from("competitor_overlap")
    .select("competitor_brand, influencer:influencers(handle)");
  if (overlapError) throw overlapError;

  const countByBrandHandle = new Map<string, Map<string, number>>();
  for (const row of overlap ?? []) {
    const r = row as unknown as { competitor_brand: string; influencer: { handle: string } | null };
    if (!r.influencer?.handle) continue;
    if (!countByBrandHandle.has(r.competitor_brand)) countByBrandHandle.set(r.competitor_brand, new Map());
    const byHandle = countByBrandHandle.get(r.competitor_brand)!;
    byHandle.set(r.influencer.handle, (byHandle.get(r.influencer.handle) ?? 0) + 1);
  }
  Array.from(countByBrandHandle.entries()).forEach(([brand, byHandle]) => {
    if (result.has(brand)) return;
    const top = Array.from(byHandle.entries()).sort((a, b) => b[1] - a[1])[0];
    if (top) result.set(brand, top[0]);
  });

  return result;
}
