import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignInfluencerFull,
  CampaignInfluencerWithCampaign,
  CampaignInfluencerWithInfluencer,
  Influencer,
} from "@/lib/types";
import type { DiscoveryPlatform, SavedCreatorRow, SearchHistoryRow } from "@/lib/modash/types";

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getInfluencers(): Promise<Influencer[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("influencers")
    .select("*")
    .order("ai_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInfluencerById(id: string): Promise<Influencer | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("influencers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// All pipeline placements across every campaign, joined with influencer + campaign — powers the dashboard kanban.
export async function getAllCampaignInfluencers(): Promise<
  (CampaignInfluencerWithInfluencer & CampaignInfluencerWithCampaign)[]
> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select("*, influencer:influencers(*), campaign:campaigns(*)")
    .order("stage_updated_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getCampaignInfluencersForCampaign(
  campaignId: string
): Promise<CampaignInfluencerWithInfluencer[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select("*, influencer:influencers(*)")
    .eq("campaign_id", campaignId)
    .order("stage_updated_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getSavedCreators(userId: string): Promise<SavedCreatorRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("saved_creators")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getCachedProfile(
  userId: string,
  platform: DiscoveryPlatform,
  modashUserId: string
): Promise<SavedCreatorRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("saved_creators")
    .select("*")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("modash_user_id", modashUserId)
    .maybeSingle();
  if (error) throw error;
  return data as never;
}

export async function getRecentSearches(userId: string, limit = 5): Promise<SearchHistoryRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as never;
}

export async function getFullPlacementsForCampaign(
  campaignId: string
): Promise<CampaignInfluencerFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select(
      "*, influencer:influencers(*), campaign:campaigns(*), communications(*), deliverables(*), gifts(*)"
    )
    .eq("campaign_id", campaignId)
    .order("stage_updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

// All pipeline placements for a single influencer across campaigns (an influencer profile page).
export async function getCampaignInfluencersForInfluencer(
  influencerId: string
): Promise<CampaignInfluencerWithCampaign[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select("*, campaign:campaigns(*)")
    .eq("influencer_id", influencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getFullPlacementsForInfluencer(
  influencerId: string
): Promise<CampaignInfluencerFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select(
      "*, influencer:influencers(*), campaign:campaigns(*), communications(*), deliverables(*), gifts(*)"
    )
    .eq("influencer_id", influencerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    communications: (row.communications ?? []).sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  })) as never;
}

export async function getCampaignInfluencerFull(
  campaignInfluencerId: string
): Promise<CampaignInfluencerFull | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("campaign_influencers")
    .select(
      "*, influencer:influencers(*), campaign:campaigns(*), communications(*), deliverables(*), gifts(*)"
    )
    .eq("id", campaignInfluencerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    communications: (data.communications ?? []).sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  } as never;
}
