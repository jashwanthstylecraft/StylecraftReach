import type { DiscoveryPlatform } from "@/lib/modash/types";

export type ReportPlatform = "instagram" | "tiktok" | "youtube" | "all";
export type SocialPlatform = "instagram" | "tiktok" | "youtube";

export interface Report {
  id: string;
  name: string;
  platform: ReportPlatform;
  filters: Record<string, unknown> | null;
  influencer_ids: string[];
  post_ids: string[];
  post_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  campaign_id: string | null;
}

export interface CommunityList {
  id: string;
  name: string;
  description: string | null;
  influencer_ids: string[];
  created_by: string | null;
  created_at: string;
}

export interface SocialConnection {
  id: string;
  workspace_id: string;
  platform: SocialPlatform;
  account_id: string;
  account_name: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  followers: number | null;
  is_active: boolean;
  connected_at: string;
  last_synced_at: string | null;
}

export interface BrandDefinition {
  id: string;
  name: string;
  handle: string;
  color: string;
  isOwnBrand: boolean;
}

// Colors are the dataviz skill's validated 6-of-8 categorical order (adjacent-pair
// CVD-safe in dark mode: worst adjacent ΔE 8.4) — fixed hue-to-brand assignment,
// never cycled or re-ordered per render.
export const DEFAULT_BRANDS: BrandDefinition[] = [
  { id: "stylecraft", name: "Stylecraft", handle: "@stylecraftpro", color: "#3987e5", isOwnBrand: true },
  { id: "gammaplusna", name: "GAMMA+", handle: "@gammaplusna", color: "#d95926", isOwnBrand: true },
  { id: "johnnybhair", name: "Johnny B", handle: "@johnnybhair", color: "#199e70", isOwnBrand: true },
  { id: "braun", name: "Braun", handle: "@braun", color: "#c98500", isOwnBrand: false },
  { id: "wahl", name: "Wahl", handle: "@wahlpro", color: "#d55181", isOwnBrand: false },
  { id: "andis", name: "Andis", handle: "@andiscompany", color: "#008300", isOwnBrand: false },
];

export type DashboardMetric = "posts" | "reach" | "engagement" | "emv" | "likes" | "comments" | "views";
export type Granularity = "MONTH" | "WEEK" | "DAY";

export interface TrendsDashboardFilters {
  brandIds: string[];
  from: string;
  to: string;
  granularity: Granularity;
  hashtagOrCaption: string;
  metric: DashboardMetric;
  locations: string[];
  sponsoredOnly: boolean;
}

export interface TrendsDataPoint {
  date: string;
  [brandId: string]: number | string;
}

export interface BrandComparisonRow {
  brandId: string;
  brandName: string;
  posts: number;
  totalReach: number;
  avgEngagement: number;
  totalEmv: number;
  topInfluencer: string | null;
}

export interface SimilarCreator {
  handle: string;
  avatarSeed: string;
  platform: DiscoveryPlatform;
}
