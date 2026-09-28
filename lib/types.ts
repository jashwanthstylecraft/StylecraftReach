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
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  stripe_onboarded_at: string | null;
  clerk_user_id: string | null;
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

export type DiscountType = "percentage" | "fixed";
export type ConversionSource = "promo_code" | "affiliate_link" | "both";

export interface AffiliateLink {
  id: string;
  campaign_influencer_id: string;
  dub_link_id: string;
  short_link: string;
  destination_url: string;
  clicks: number;
  conversions: number;
  revenue: number;
  last_synced_at: string | null;
  created_at: string;
}

export interface PromoCode {
  id: string;
  campaign_influencer_id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  commission_rate: number;
  usage_count: number;
  usage_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Conversion {
  id: string;
  campaign_influencer_id: string;
  promo_code_id: string | null;
  affiliate_link_id: string | null;
  order_id: string;
  order_amount: number;
  commission_amount: number;
  commission_paid: boolean;
  commission_paid_at: string | null;
  customer_id: string | null;
  source: ConversionSource;
  created_at: string;
}

export interface DailyStat {
  id: string;
  campaign_influencer_id: string;
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission_amount: number;
  created_at: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired";
export type SubmissionStatus = "pending_review" | "approved" | "needs_revision" | "rejected";
export type SenderRole = "brand" | "influencer";

export interface InfluencerInvitation {
  id: string;
  influencer_id: string;
  clerk_invitation_id: string | null;
  clerk_user_id: string | null;
  email: string;
  status: InvitationStatus;
  accepted_at: string | null;
  created_at: string;
}

export interface ContentSubmission {
  id: string;
  deliverable_id: string;
  campaign_influencer_id: string;
  submitted_url: string | null;
  caption: string | null;
  notes: string | null;
  status: SubmissionStatus;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PortalMessage {
  id: string;
  campaign_influencer_id: string;
  sender_role: SenderRole;
  sender_id: string;
  sender_name: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface InfluencerNotificationPrefs {
  id: string;
  influencer_id: string;
  email_on_payment: boolean;
  email_on_approval: boolean;
  email_on_deliverable: boolean;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean;
  updated_at: string;
}

// Joined shapes used across the CRM views
export interface CampaignInfluencerWithInfluencer extends CampaignInfluencer {
  influencer: Influencer;
}

export interface CampaignInfluencerWithCampaign extends CampaignInfluencer {
  campaign: Campaign;
}

export type PaymentType = "flat_fee" | "commission" | "bonus";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";
export type ScheduleStatus = "scheduled" | "processing" | "paid" | "cancelled";

export interface Payment {
  id: string;
  campaign_influencer_id: string;
  payment_type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_transfer_id: string | null;
  stripe_account_id: string | null;
  description: string | null;
  period_start: string | null;
  period_end: string | null;
  invoice_id: string | null;
  paid_at: string | null;
  failed_reason: string | null;
  created_at: string;
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  payment_id: string;
  invoice_number: string;
  influencer_id: string;
  campaign_id: string;
  amount: number;
  currency: string;
  description: string | null;
  line_items: LineItem[];
  pdf_url: string | null;
  issued_at: string;
  due_at: string | null;
}

export interface PaymentSchedule {
  id: string;
  campaign_influencer_id: string;
  payment_type: PaymentType;
  amount: number | null;
  scheduled_date: string;
  status: ScheduleStatus;
  notes: string | null;
  created_at: string;
}

export interface InfluencerPerformanceRow {
  campaignInfluencerId: string;
  influencer: Influencer;
  campaign: Campaign;
  stage: Stage;
  fee: number | null;
  affiliateLink: AffiliateLink | null;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  roi: number | null;
}

export interface AnalyticsSummary {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  overallRoi: number | null;
  avgOrderValue: number | null;
}

export interface CampaignInfluencerFull extends CampaignInfluencer {
  influencer: Influencer;
  campaign: Campaign;
  communications: Communication[];
  deliverables: Deliverable[];
  gifts: Gift[];
}
