import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { createServerClient } from "@/lib/supabase/server";
import { getHashtagAnalytics } from "@/lib/modash/content";

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const supabase = createServerClient();
  const { data: hashtags, error } = await supabase.from("tracked_hashtags").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let synced = 0;
  for (const row of hashtags ?? []) {
    const analytics = await getHashtagAnalytics(row.hashtag);
    const weeklyPostCount = Math.max(0, analytics.postCount - row.post_count);

    await supabase
      .from("tracked_hashtags")
      .update({
        post_count: analytics.postCount,
        weekly_post_count: weeklyPostCount,
        total_reach: analytics.totalReach,
        avg_engagement: analytics.avgEngagement,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    synced++;
  }

  return NextResponse.json({ synced, timestamp: new Date().toISOString() });
}
