import { NextRequest, NextResponse } from "next/server";
import { requireCronSecretOrSignedIn } from "@/lib/cron-auth";
import { createServerClient } from "@/lib/supabase/server";
import { getModashPosts } from "@/lib/modash/content";
import { analyzeSentiment } from "@/lib/sentiment";

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecretOrSignedIn(req);
  if (unauthorized) return unauthorized;

  const supabase = createServerClient();

  const { data: activeCIs, error } = await supabase
    .from("campaign_influencers")
    .select("id, influencer:influencers(id, handle, platform, modash_user_id)")
    .eq("stage", "Active");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seen = new Set<string>();
  let captured = 0;

  for (const ci of activeCIs ?? []) {
    const inf = ci.influencer as unknown as {
      id: string;
      handle: string;
      platform: "Instagram" | "TikTok" | "YouTube" | "X";
      modash_user_id: string | null;
    };
    if (seen.has(inf.id) || inf.platform === "X") continue;
    seen.add(inf.id);

    const posts = await getModashPosts(inf.modash_user_id ?? inf.id, inf.platform, { storiesOnly: true });

    for (const post of posts) {
      const { data: existing } = await supabase
        .from("captured_content")
        .select("id")
        .eq("modash_post_id", post.id)
        .maybeSingle();
      if (existing) continue;

      const sentiment = await analyzeSentiment(post.caption, post.topComments, inf.platform, "StylecraftUS");

      await supabase.from("captured_content").insert({
        campaign_influencer_id: ci.id,
        influencer_id: inf.id,
        modash_post_id: post.id,
        platform: inf.platform,
        media_type: "story",
        post_url: post.url,
        thumbnail_url: post.thumbnailUrl,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        views: post.views,
        shares: post.shares,
        posted_at: post.postedAt,
        is_story: true,
        expires_at: post.expiresAt,
        sentiment_score: sentiment.sentimentScore,
        overall_sentiment: sentiment.overallSentiment,
        brand_sentiment: sentiment.brandSentiment,
        key_themes: sentiment.keyThemes,
        red_flags: sentiment.redFlags,
        quotable_comment: sentiment.quotableComment,
        sentiment_summary: sentiment.summary,
        sentiment_analyzed_at: new Date().toISOString(),
      });
      captured++;

      const hoursUntilExpiry = post.expiresAt
        ? (new Date(post.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
        : Infinity;
      if (hoursUntilExpiry < 6 && process.env.N8N_STORY_CAPTURE_WEBHOOK) {
        fetch(process.env.N8N_STORY_CAPTURE_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "story_expiring_soon",
            influencerHandle: inf.handle,
            postUrl: post.url,
            expiresAt: post.expiresAt,
          }),
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({ captured, timestamp: new Date().toISOString() });
}
