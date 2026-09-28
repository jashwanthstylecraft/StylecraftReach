import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import { renderDigestEmail } from "@/lib/email/digest-template";
import { getCompetitorOverlapRows } from "@/lib/intelligence-data";
import type {
  CompetitorAlert,
  HashtagTrend,
  IntelligenceDigest,
  NotableMention,
  RecommendedAction,
  SentimentOverview,
  TopContentEntry,
} from "@/lib/intelligence-types";

const MODEL = "claude-sonnet-5";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function currentWeekBounds(reference = new Date()): { weekStart: Date; weekEnd: Date } {
  const day = reference.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(reference);
  weekStart.setDate(reference.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { weekStart, weekEnd };
}

async function getTopContentThisWeek(weekStart: Date, weekEnd: Date): Promise<TopContentEntry[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("captured_content")
    .select("*, influencer:influencers(handle)")
    .gte("posted_at", weekStart.toISOString())
    .lte("posted_at", weekEnd.toISOString())
    .order("views", { ascending: false })
    .limit(5);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      platform: TopContentEntry["platform"];
      media_type: TopContentEntry["mediaType"];
      views: number;
      likes: number;
      sentiment_score: number | null;
      thumbnail_url: string | null;
      post_url: string;
      influencer: { handle: string };
    };
    return {
      id: r.id,
      handle: r.influencer.handle,
      platform: r.platform,
      mediaType: r.media_type,
      views: r.views,
      likes: r.likes,
      sentimentScore: r.sentiment_score,
      thumbnailUrl: r.thumbnail_url,
      postUrl: r.post_url,
    };
  });
}

async function getMentionStatsThisWeek(weekStart: Date, weekEnd: Date) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("brand_mentions")
    .select("*")
    .gte("posted_at", weekStart.toISOString())
    .lte("posted_at", weekEnd.toISOString());
  if (error) throw error;

  const rows = data ?? [];
  const notable: NotableMention[] = rows
    .filter((m) => (m.author_followers ?? 0) >= 10000)
    .map((m) => ({
      handle: m.author_handle,
      followers: m.author_followers ?? 0,
      summary: m.caption ?? "",
      recommendation: m.actioned ? "Already actioned" : "Consider adding to CRM",
    }));

  return { totalMentions: rows.length, notable };
}

async function getSentimentOverviewThisWeek(weekStart: Date, weekEnd: Date) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("captured_content")
    .select("*, influencer:influencers(handle)")
    .gte("posted_at", weekStart.toISOString())
    .lte("posted_at", weekEnd.toISOString())
    .not("sentiment_score", "is", null);
  if (error) throw error;

  const rows = (data ?? []) as unknown as {
    sentiment_score: number;
    key_themes: string[] | null;
    influencer: { handle: string };
  }[];

  if (rows.length === 0) {
    return { score: 0, label: "No data", topTheme: "—", biggestMover: "—" };
  }

  const avgScore = Math.round(rows.reduce((s, r) => s + r.sentiment_score, 0) / rows.length);
  const themeCounts = new Map<string, number>();
  rows.forEach((r) => (r.key_themes ?? []).forEach((t) => themeCounts.set(t, (themeCounts.get(t) ?? 0) + 1)));
  const topTheme = Array.from(themeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const biggestMoverRow = [...rows].sort((a, b) => b.sentiment_score - a.sentiment_score)[0];

  return {
    score: avgScore,
    label: avgScore > 50 ? "Very Positive" : avgScore > 15 ? "Positive" : avgScore > -15 ? "Neutral" : avgScore > -50 ? "Negative" : "Very Negative",
    topTheme,
    biggestMover: biggestMoverRow ? `${biggestMoverRow.influencer.handle} (+${biggestMoverRow.sentiment_score})` : "—",
  };
}

async function getNewCompetitorOverlapsThisWeek(weekStart: Date, weekEnd: Date): Promise<CompetitorAlert[]> {
  const rows = await getCompetitorOverlapRows();
  return rows
    .filter((r) => {
      const detected = new Date(r.detected_at);
      return detected >= weekStart && detected <= weekEnd;
    })
    .map((r) => ({
      influencer: r.influencer.handle,
      competitor: r.competitor_brand,
      risk: r.risk,
      action: r.notes ?? `Detected via ${r.evidence_type}`,
    }));
}

async function getHashtagTrendsThisWeek(): Promise<HashtagTrend[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("tracked_hashtags")
    .select("*")
    .order("post_count", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []).map((h) => ({
    hashtag: h.hashtag,
    isOwnBrand: h.is_own_brand,
    postCount: h.post_count,
    avgEngagement: h.avg_engagement,
  }));
}

interface DigestNarrative {
  headline: string;
  executiveSummary: string;
  sentimentOverview: SentimentOverview;
  notableOrganicMentions: NotableMention[];
  competitorAlerts: CompetitorAlert[];
  recommendedActions: RecommendedAction[];
}

function mockNarrative(
  topContent: TopContentEntry[],
  mentionStats: { totalMentions: number; notable: NotableMention[] },
  sentiment: SentimentOverview,
  competitorAlerts: CompetitorAlert[]
): DigestNarrative {
  const top = topContent[0];
  const headline = top
    ? `${top.handle}'s ${top.mediaType} led the week with ${top.views.toLocaleString()} views`
    : "A quiet week for captured content — no new posts tracked";

  const actions: RecommendedAction[] = [];
  mentionStats.notable
    .filter((m) => m.recommendation === "Consider adding to CRM")
    .slice(0, 2)
    .forEach((m) =>
      actions.push({
        priority: actions.length + 1,
        action: `Reach out to ${m.handle} — organic advocate with ${m.followers.toLocaleString()} followers`,
        reason: "Mentioned the brand without being paid — good gifting candidate",
      })
    );
  competitorAlerts.slice(0, 2).forEach((a) =>
    actions.push({
      priority: actions.length + 1,
      action: `Review ${a.influencer}'s exclusivity terms — ${a.competitor} conflict detected`,
      reason: a.action,
    })
  );
  if (actions.length === 0) {
    actions.push({ priority: 1, action: "No urgent actions this week", reason: "Metrics are steady" });
  }

  return {
    headline,
    executiveSummary: `${mentionStats.totalMentions} brand mentions and ${topContent.length} pieces of tracked content this week. Overall sentiment: ${sentiment.label} (${sentiment.score >= 0 ? "+" : ""}${sentiment.score}). ${competitorAlerts.length > 0 ? `${competitorAlerts.length} competitor overlap${competitorAlerts.length === 1 ? "" : "s"} detected.` : "No new competitor overlaps this week."}`,
    sentimentOverview: sentiment,
    notableOrganicMentions: mentionStats.notable,
    competitorAlerts,
    recommendedActions: actions,
  };
}

async function generateNarrative(
  topContent: TopContentEntry[],
  mentionStats: { totalMentions: number; notable: NotableMention[] },
  sentiment: SentimentOverview,
  competitorAlerts: CompetitorAlert[],
  hashtagTrends: HashtagTrend[]
): Promise<DigestNarrative> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockNarrative(topContent, mentionStats, sentiment, competitorAlerts);
  }

  const client = new Anthropic();
  const prompt = `You are the intelligence analyst for StylecraftUS, a professional grooming brand (sub-brands: GAMMA+, Johnny B).

Generate a weekly intelligence digest from this data. Be specific, actionable, and sharp. Reference real numbers.

TOP CONTENT THIS WEEK:
${JSON.stringify(topContent, null, 2)}

BRAND MENTION STATS:
${JSON.stringify(mentionStats, null, 2)}

SENTIMENT OVERVIEW:
${JSON.stringify(sentiment, null, 2)}

COMPETITOR ALERTS:
${JSON.stringify(competitorAlerts, null, 2)}

HASHTAG TRENDS:
${JSON.stringify(hashtagTrends, null, 2)}

Return ONLY valid JSON:
{
  "headline": "<one punchy sentence — the most important thing that happened this week>",
  "executiveSummary": "<2-3 sentences — the story of the week for a CMO>",
  "sentimentOverview": { "score": <-100 to 100>, "label": "<Very Positive|Positive|Neutral|Negative|Very Negative>", "topTheme": "<most discussed topic>", "biggestMover": "<influencer or trend that changed most>" },
  "notableOrganicMentions": [{ "handle": "", "followers": 0, "summary": "", "recommendation": "" }],
  "competitorAlerts": [{ "influencer": "", "competitor": "", "risk": "High|Medium|Low", "action": "" }],
  "recommendedActions": [{ "priority": 1, "action": "<specific, actionable step>", "reason": "<why>" }]
}`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return mockNarrative(topContent, mentionStats, sentiment, competitorAlerts);
  }
}

export async function generateDigestForWeek(reference = new Date()): Promise<IntelligenceDigest> {
  const { weekStart, weekEnd } = currentWeekBounds(reference);
  const supabase = createServerClient();

  const [topContent, mentionStats, sentiment, competitorAlerts, hashtagTrends] = await Promise.all([
    getTopContentThisWeek(weekStart, weekEnd),
    getMentionStatsThisWeek(weekStart, weekEnd),
    getSentimentOverviewThisWeek(weekStart, weekEnd),
    getNewCompetitorOverlapsThisWeek(weekStart, weekEnd),
    getHashtagTrendsThisWeek(),
  ]);

  const narrative = await generateNarrative(topContent, mentionStats, sentiment, competitorAlerts, hashtagTrends);

  const emailHtml = renderDigestEmail({
    weekStart,
    weekEnd,
    headline: narrative.headline,
    executiveSummary: narrative.executiveSummary,
    recommendedActions: narrative.recommendedActions,
    competitorAlerts: narrative.competitorAlerts,
  });

  const { data: digest, error } = await supabase
    .from("intelligence_digests")
    .upsert(
      {
        week_start: toISODate(weekStart),
        week_end: toISODate(weekEnd),
        headline: narrative.headline,
        executive_summary: narrative.executiveSummary,
        top_performing_content: topContent,
        sentiment_overview: narrative.sentimentOverview,
        mention_highlights: narrative.notableOrganicMentions,
        competitor_alerts: narrative.competitorAlerts,
        hashtag_trends: hashtagTrends,
        recommended_actions: narrative.recommendedActions,
        raw_data: { topContent, mentionStats, sentiment, competitorAlerts, hashtagTrends },
        email_html: emailHtml,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "week_start" }
    )
    .select()
    .single();

  if (error) throw error;
  return digest as never;
}
