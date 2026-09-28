import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { DEFAULT_BRANDS, type BrandComparisonRow } from "@/lib/affable-types";

export async function getBrandComparisonRows(): Promise<BrandComparisonRow[]> {
  const supabase = createServerClient();
  const { data: hashtags, error } = await supabase
    .from("tracked_hashtags")
    .select("brand, post_count, total_reach, avg_engagement");
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
    };
  });
}
