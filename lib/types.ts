export type Brand = "Stylecraft" | "GAMMA+" | "Johnny B";
export type CampaignStatus = "draft" | "active" | "completed" | "paused";
export type Platform = "Instagram" | "TikTok" | "YouTube" | "X";
export type Stage =
  | "Shortlisted"
  | "Outreach sent"
  | "Negotiating"
  | "Active"
  | "Completed";
export type CommunicationType = "note" | "email" | "dm" | "call";

export const STAGES: Stage[] = [
  "Shortlisted",
  "Outreach sent",
  "Negotiating",
  "Active",
  "Completed",
];

export const PLATFORMS: Platform[] = ["Instagram", "TikTok", "YouTube", "X"];

export const BRANDS: Brand[] = ["Stylecraft", "GAMMA+", "Johnny B"];

export interface Campaign {
  id: string;
  name: string;
  brand: Brand;
  status: CampaignStatus;
  budget: number | null;
  spend: number;
  start_date: string | null;
  end_date: string | null;
  brief: string | null;
  created_at: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  followers: number | null;
  engagement_rate: number | null;
  email: string | null;
  location: string | null;
  niche: string | null;
  avatar_url: string | null;
  ai_score: number | null;
  notes: string | null;
  created_at: string;
}

export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  stage: Stage;
  fee: number | null;
  commission_rate: number | null;
  affiliate_code: string | null;
  affiliate_link: string | null;
  stage_updated_at: string;
  created_at: string;
}

export interface Communication {
  id: string;
  campaign_influencer_id: string;
  type: CommunicationType;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface Deliverable {
  id: string;
  campaign_influencer_id: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  content_url: string | null;
  created_at: string;
}

export interface Gift {
  id: string;
  campaign_influencer_id: string;
  product_name: string;
  tracking_number: string | null;
  shipped_date: string | null;
  delivered: boolean;
  created_at: string;
}

// Joined shapes used across the CRM views
export interface CampaignInfluencerWithInfluencer extends CampaignInfluencer {
  influencer: Influencer;
}

export interface CampaignInfluencerWithCampaign extends CampaignInfluencer {
  campaign: Campaign;
}

export interface CampaignInfluencerFull extends CampaignInfluencer {
  influencer: Influencer;
  campaign: Campaign;
  communications: Communication[];
  deliverables: Deliverable[];
  gifts: Gift[];
}
