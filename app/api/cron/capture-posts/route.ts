import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { createServerClient } from "@/lib/supabase/server";
import { getModashPosts } from "@/lib/modash/content";
import { analyzeSentiment } from "@/lib/sentiment";

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const supabase = createServerClient();

  const [{ data: allCIs, error: ciError }, { data: hashtags, error: hashtagError }] = await Promise.all([
    supabase.from("campaign_influencers").select("id, influencer:influencers(id, handle, platform, modash_user_id)"),
    supabase.from("tracked_hashtags").select("hashtag, brand, is_own_brand"),
  ]);
  if (ciError) return NextResponse.json({ error: ciError.message }, { status: 500 });
  if (hashtagError) return NextResponse.json({ error: hashtagError.message }, { status: 500 });

  const ownHashtags = (hashtags ?? []).filter((h) => h.is_own_brand).map((h) => h.hashtag.toLowerCase());
  const competitorHashtags = (hashtags ?? []).filter((h) => !h.is_own_brand);

  const seen = new Map<string, string>(); // influencer id -> campaign_influencer id
  for (const ci of allCIs ?? []) {
    const inf = ci.influencer as unknown as { id: string };
    if (!seen.has(inf.id)) seen.set(inf.id, ci.id);
  }

  let captured = 0;

  for (const ci of allCIs ?? []) {
    const inf = ci.influencer as unknown as {
      id: string;
      handle: string;
      platform: "Instagram" | "TikTok" | "YouTube" | "X";
      modash_user_id: string | null;
    };
    if (seen.get(inf.id) !== ci.id || inf.platform === "X") continue; // process each influencer once

    const posts = await getModashPosts(inf.modash_user_id ?? inf.id, inf.platform, { storiesOnly: false, limit: 10 });

    for (const post of posts) {
      if (post.isStory) continue; // stories are capture-stories' job

      const { data: existing } = await supabase
        .from("captured_content")
        .select("id")
        .eq("modash_post_id", post.id)
        .maybeSingle();
      if (existing) continue;

      const captionLower = post.caption.toLowerCase();
      const usesHashtag = ownHashtags.some((h) => captionLower.includes(h));
      const matchedCompetitor = competitorHashtags.find((h) => captionLower.includes(h.hashtag.toLowerCase()));

      const sentiment = await analyzeSentiment(post.caption, post.topComments, inf.platform, "StylecraftUS");

      await supabase.from("captured_content").insert({
        campaign_influencer_id: ci.id,
        influencer_id: inf.id,
        modash_post_id: post.id,
        platform: inf.platform,
        media_type: post.mediaType === "video" && inf.platform === "YouTube" ? "short" : post.mediaType,
        post_url: post.url,
        thumbnail_url: post.thumbnailUrl,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        views: post.views,
        shares: post.shares,
        posted_at: post.postedAt,
        is_story: false,
        mentions_brand: usesHashtag,
        uses_hashtag: usesHashtag,
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

      if (matchedCompetitor) {
        await supabase
          .from("competitor_overlap")
          .upsert(
            {
              influencer_id: inf.id,
              competitor_brand: matchedCompetitor.brand ?? matchedCompetitor.hashtag,
              post_url: post.url,
              post_date: post.postedAt.slice(0, 10),
              evidence_type: "hashtag",
              notes: `Used #${matchedCompetitor.hashtag} in a post caption`,
            },
            { onConflict: "influencer_id,competitor_brand,post_date" }
          );

        if (process.env.N8N_POST_CAPTURE_WEBHOOK) {
          fetch(process.env.N8N_POST_CAPTURE_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "competitor_overlap_detected",
              influencerHandle: inf.handle,
              competitorBrand: matchedCompetitor.brand ?? matchedCompetitor.hashtag,
              postUrl: post.url,
            }),
          }).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ captured, timestamp: new Date().toISOString() });
}
