import type { DiscoveryPlatform } from "@/lib/modash/types";

export type MediaType = "image" | "video" | "reel" | "story" | "carousel" | "short";
export type SentimentLabel = "positive" | "neutral" | "negative" | "mixed";
export type MentionType = "tag" | "hashtag" | "keyword";
export type ActionTaken = "replied" | "reposted" | "ignored" | "added_to_crm";
export type EvidenceType = "tag" | "hashtag" | "paid_partnership" | "gifted";
export type RiskLevel = "High" | "Medium" | "Low";

export interface CapturedContent {
  id: string;
  campaign_influencer_id: string | null;
  influencer_id: string;
  modash_post_id: string;
  platform: DiscoveryPlatform;
  media_type: MediaType;
  post_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  posted_at: string | null;
  is_story: boolean;
  expires_at: string | null;
  captured_at: string;
  sentiment_score: number | null;
  overall_sentiment: SentimentLabel | null;
  brand_sentiment: SentimentLabel | null;
  key_themes: string[] | null;
  red_flags: string[] | null;
  quotable_comment: string | null;
  sentiment_summary: string | null;
  sentiment_analyzed_at: string | null;
  mentions_brand: boolean;
  uses_promo_code: boolean;
  uses_hashtag: boolean;
  approved_by_brand: boolean | null;
  featured: boolean;
  emv: number | null;
}

export interface BrandMention {
  id: string;
  platform: DiscoveryPlatform;
  post_url: string;
  author_handle: string;
  author_followers: number | null;
  caption: string | null;
  thumbnail_url: string | null;
  likes: number;
  comments: number;
  views: number;
  mention_type: MentionType;
  matched_keyword: string | null;
  sentiment: SentimentLabel | null;
  sentiment_score: number | null;
  posted_at: string | null;
  captured_at: string;
  actioned: boolean;
  action_taken: ActionTaken | null;
  saved: boolean;
  emv: number | null;
}

export interface TrackedHashtag {
  id: string;
  hashtag: string;
  brand: string | null;
  is_own_brand: boolean;
  post_count: number;
  weekly_post_count: number;
  total_reach: number;
  avg_engagement: number | null;
  last_synced_at: string | null;
  created_at: string;
}

export interface CompetitorOverlap {
  id: string;
  influencer_id: string;
  competitor_brand: string;
  post_url: string | null;
  post_date: string | null;
  evidence_type: EvidenceType;
  notes: string | null;
  alert_enabled: boolean;
  detected_at: string;
}

export interface TopContentEntry {
  id: string;
  handle: string;
  platform: DiscoveryPlatform;
  mediaType: MediaType;
  views: number;
  likes: number;
  sentimentScore: number | null;
  thumbnailUrl: string | null;
  postUrl: string;
}

export interface SentimentOverview {
  score: number;
  label: string;
  topTheme: string;
  biggestMover: string;
}

export interface NotableMention {
  handle: string;
  followers: number;
  summary: string;
  recommendation: string;
}

export interface CompetitorAlert {
  influencer: string;
  competitor: string;
  risk: RiskLevel;
  action: string;
}

export interface RecommendedAction {
  priority: number;
  action: string;
  reason: string;
}

export interface HashtagTrend {
  hashtag: string;
  isOwnBrand: boolean;
  postCount: number;
  avgEngagement: number | null;
}

export interface IntelligenceDigest {
  id: string;
  week_start: string;
  week_end: string;
  generated_at: string;
  sent_at: string | null;
  headline: string | null;
  executive_summary: string | null;
  top_performing_content: TopContentEntry[] | null;
  sentiment_overview: SentimentOverview | null;
  mention_highlights: NotableMention[] | null;
  competitor_alerts: CompetitorAlert[] | null;
  hashtag_trends: HashtagTrend[] | null;
  recommended_actions: RecommendedAction[] | null;
  raw_data: unknown;
  email_html: string | null;
}

export interface SentimentAnalysis {
  overallSentiment: SentimentLabel;
  sentimentScore: number;
  brandSentiment: "positive" | "neutral" | "negative";
  keyThemes: string[];
  redFlags: string[];
  quotableComment: string;
  summary: string;
}
