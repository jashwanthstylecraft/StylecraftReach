import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { analyzeSentiment } from "@/lib/sentiment";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const { postId, caption, comments, platform, brand } = (await req.json()) as {
    postId?: string;
    caption: string;
    comments: string[];
    platform?: string;
    brand?: string;
  };

  const result = await analyzeSentiment(caption ?? "", comments ?? [], platform, brand);

  if (postId) {
    const supabase = createServerClient();
    await supabase
      .from("captured_content")
      .update({
        sentiment_score: result.sentimentScore,
        overall_sentiment: result.overallSentiment,
        brand_sentiment: result.brandSentiment,
        key_themes: result.keyThemes,
        red_flags: result.redFlags,
        quotable_comment: result.quotableComment,
        sentiment_summary: result.summary,
        sentiment_analyzed_at: new Date().toISOString(),
      })
      .eq("modash_post_id", postId);
  }

  return NextResponse.json(result);
}
