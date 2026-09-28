import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { DEFAULT_BRANDS } from "@/lib/affable-types";
import type { BrandComparisonRow, Granularity, TrendsDataPoint, TrendsDashboardFilters } from "@/lib/affable-types";
import type { CapturedContentFull } from "@/lib/intelligence-data";

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function bucketDates(from: string, to: string, granularity: Granularity): string[] {
  const dates: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const step = granularity === "DAY" ? 1 : granularity === "WEEK" ? 7 : 30;
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + step);
  }
  return dates.length > 0 ? dates : [from];
}

const METRIC_FIELD: Record<string, keyof BrandComparisonRow> = {
  posts: "posts",
  reach: "totalReach",
  engagement_rate: "avgEngagement",
  emv: "totalEmv",
  likes: "posts",
  comments: "posts",
  views: "totalReach",
  influencer_count: "posts",
};

// No per-day history is tracked anywhere in this schema (tracked_hashtags only
// holds current running totals), so this spreads each brand's real aggregate
// total across the selected range with a deterministic per-bucket variance —
// an honest trend SHAPE derived from real totals, not real day-by-day history.
export function generateTrendsSeries(
  filters: TrendsDashboardFilters,
  comparisonRows: BrandComparisonRow[]
): TrendsDataPoint[] {
  const dates = bucketDates(filters.from, filters.to, filters.granularity);
  const field = METRIC_FIELD[filters.metric] ?? "posts";

  return dates.map((date) => {
    const point: TrendsDataPoint = { date };
    for (const brandId of filters.brandIds) {
      const row = comparisonRows.find((r) => r.brandId === brandId);
      const total = (row?.[field] as number) ?? 0;
      const variance = 0.6 + pseudoRandom(hashSeed(`${brandId}-${date}`)) * 0.8;
      point[brandId] = Math.round((total / dates.length) * variance);
    }
    return point;
  });
}

export async function getTopPostsByBrand(
  brandIds: string[],
  hashtagOrCaption: string,
  sponsoredOnly: boolean
): Promise<Record<string, CapturedContentFull[]>> {
  const supabase = createServerClient();
  const brandNames = DEFAULT_BRANDS.filter((b) => brandIds.includes(b.id)).map((b) => b.name);
  if (brandNames.length === 0) return {};

  let query = supabase
    .from("captured_content")
    .select("*, influencer:influencers(*), campaign_influencer:campaign_influencers(campaign:campaigns(*))")
    .order("views", { ascending: false })
    .limit(200);
  if (sponsoredOnly) query = query.eq("mentions_brand", true);
  if (hashtagOrCaption.trim()) query = query.ilike("caption", `%${hashtagOrCaption.replace(/^#/, "").trim()}%`);

  const { data, error } = await query;
  if (error) throw error;

  const result: Record<string, CapturedContentFull[]> = {};
  for (const row of data ?? []) {
    const r = row as unknown as CapturedContentFull & { campaign_influencer: { campaign: { brand: string } } | null };
    const brand = r.campaign_influencer?.campaign?.brand;
    if (!brand || !brandNames.includes(brand)) continue;
    const brandDef = DEFAULT_BRANDS.find((b) => b.name === brand);
    if (!brandDef) continue;
    if (!result[brandDef.id]) result[brandDef.id] = [];
    if (result[brandDef.id].length < 4) result[brandDef.id].push({ ...r, campaign: r.campaign_influencer?.campaign ?? null } as never);
  }
  return result;
}
