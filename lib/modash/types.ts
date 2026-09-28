export type DiscoveryPlatform = "Instagram" | "TikTok" | "YouTube";

export interface ModashProfile {
  userId: string;
  username: string;
  fullName: string;
  profilePicUrl: string;
  followers: number;
  following: number;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  avgViews: number | null;
  credibilityScore: number;
  biography: string;
  email: string | null;
  location: string;
  language: string;
  categories: string[];
  audience: {
    genderSplit: { male: number; female: number };
    ageGroups: { code: string; value: number }[];
    topLocations: { name: string; value: number }[];
  };
  recentPosts: {
    url: string;
    thumbnail: string;
    likes: number;
    comments: number;
    date: string;
  }[];
}

export interface SearchFilters {
  platforms: DiscoveryPlatform[];
  followers: { min: number | null; max: number | null };
  engagementRateMin: number | null;
  location: string | null;
  keyword: string | null;
  audienceGender: "any" | "male" | "female";
  audienceAge: string[];
  credibilityScoreMin: number | null;
}

export type Tier = "S" | "A" | "B" | "C";

export interface AiScore {
  score: number;
  tier: Tier;
  fitReason: string;
  redFlags: string[];
  suggestedCampaign: "Stylecraft" | "GAMMA+" | "Johnny B";
}

export interface SearchResult {
  profile: ModashProfile;
  platform: DiscoveryPlatform;
}

export const TIER_COLORS: Record<Tier, string> = {
  S: "#C8A96E",
  A: "#22C55E",
  B: "#F59E0B",
  C: "#9B9BA8",
};

export interface ModashPost {
  id: string;
  url: string;
  thumbnailUrl: string;
  mediaType: "image" | "video" | "reel" | "story" | "carousel";
  caption: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  postedAt: string;
  isStory: boolean;
  expiresAt?: string;
  topComments: string[];
}

export interface ModashMentionResult {
  postUrl: string;
  authorHandle: string;
  authorFollowers: number;
  platform: DiscoveryPlatform;
  caption: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  views: number;
  matchedKeyword: string;
  postedAt: string;
}

export interface ModashHashtagAnalytics {
  hashtag: string;
  postCount: number;
  totalReach: number;
  avgEngagement: number;
}

export interface SavedCreatorRow {
  id: string;
  user_id: string;
  modash_user_id: string;
  platform: DiscoveryPlatform;
  handle: string;
  full_name: string | null;
  profile_pic_url: string | null;
  followers: number | null;
  engagement_rate: number | null;
  ai_score: number | null;
  ai_tier: Tier | null;
  ai_fit_reason: string | null;
  raw_data: ModashProfile;
  created_at: string;
}

export interface SearchHistoryRow {
  id: string;
  user_id: string;
  filters: SearchFilters;
  result_count: number | null;
  created_at: string;
}

export function tierFromScore(score: number): Tier {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  return "C";
}

export function encodeDiscoveryId(platform: DiscoveryPlatform, userId: string): string {
  return encodeURIComponent(`${platform}:${userId}`);
}

export function decodeDiscoveryId(id: string): { platform: DiscoveryPlatform; userId: string } | null {
  const decoded = decodeURIComponent(id);
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return null;
  const platform = decoded.slice(0, separatorIndex) as DiscoveryPlatform;
  const userId = decoded.slice(separatorIndex + 1);
  if (!["Instagram", "TikTok", "YouTube"].includes(platform)) return null;
  return { platform, userId };
}
