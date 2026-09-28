export interface CampaignSummary {
  campaign_id: string;
  influencer_count: number;
  video_count: number;
  image_count: number;
  total_likes: number;
  total_comments: number;
  total_views: number;
  avg_engagement: number;
  est_reach: number;
  est_impressions: number;
  est_emv: number;
}

export interface ProposalDeliverable {
  type: string;
  quantity: number;
  deadline: string | null;
  notes: string | null;
}

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export interface Proposal {
  id: string;
  campaign_influencer_id: string;
  deliverables: ProposalDeliverable[];
  fee: number | null;
  notes: string | null;
  status: ProposalStatus;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface CreatorPortalSettings {
  id: string;
  campaign_id: string;
  show_brief: boolean;
  show_deliverables: boolean;
  show_gifting: boolean;
  show_earnings: boolean;
  show_other_influencers: boolean;
  welcome_message: string | null;
  created_at: string;
}

export type EmailTemplateKind = "invitation" | "reminder" | "custom";

export interface CampaignEmailSent {
  id: string;
  campaign_influencer_id: string;
  template: EmailTemplateKind;
  subject: string;
  body: string;
  sent_by: string | null;
  delivered: boolean;
  created_at: string;
}

export interface SavedDashboard {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}
