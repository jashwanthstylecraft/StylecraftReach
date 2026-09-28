import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { createServerClient } from "@/lib/supabase/server";
import { searchMentions } from "@/lib/modash/content";
import { analyzeSentiment } from "@/lib/sentiment";
import type { DiscoveryPlatform } from "@/lib/modash/types";

const EXTRA_KEYWORDS = ["@gammaplus_official", "@johnnybhair", "gamma clipper"];
const PLATFORMS: DiscoveryPlatform[] = ["Instagram", "TikTok", "YouTube"];

function mentionType(keyword: string): "tag" | "hashtag" | "keyword" {
  if (keyword.startsWith("@")) return "tag";
  if (keyword.startsWith("#")) return "hashtag";
  return "keyword";
}

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const supabase = createServerClient();

  const { data: hashtags, error: hashtagError } = await supabase
    .from("tracked_hashtags")
    .select("hashtag")
    .eq("is_own_brand", true);
  if (hashtagError) return NextResponse.json({ error: hashtagError.message }, { status: 500 });

  const keywords = [...EXTRA_KEYWORDS, ...(hashtags ?? []).map((h) => `#${h.hashtag}`)];
  const results = await searchMentions(keywords, PLATFORMS);

  let inserted = 0;
  let highReachAlerts = 0;

  for (const mention of results) {
    const { data: existing } = await supabase
      .from("brand_mentions")
      .select("id")
      .eq("post_url", mention.postUrl)
      .maybeSingle();
    if (existing) continue;

    const sentiment = await analyzeSentiment(mention.caption, [], mention.platform, "StylecraftUS");

    await supabase.from("brand_mentions").insert({
      platform: mention.platform,
      post_url: mention.postUrl,
      author_handle: mention.authorHandle,
      author_followers: mention.authorFollowers,
      caption: mention.caption,
      thumbnail_url: mention.thumbnailUrl,
      likes: mention.likes,
      comments: mention.comments,
      views: mention.views,
      mention_type: mentionType(mention.matchedKeyword),
      matched_keyword: mention.matchedKeyword,
      sentiment: sentiment.overallSentiment,
      sentiment_score: sentiment.sentimentScore,
      posted_at: mention.postedAt,
    });
    inserted++;

    if (mention.authorFollowers > 50000 && process.env.N8N_MENTION_CHECK_WEBHOOK) {
      highReachAlerts++;
      fetch(process.env.N8N_MENTION_CHECK_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "high_reach_mention",
          authorHandle: mention.authorHandle,
          authorFollowers: mention.authorFollowers,
          postUrl: mention.postUrl,
          matchedKeyword: mention.matchedKeyword,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ inserted, highReachAlerts, timestamp: new Date().toISOString() });
}
