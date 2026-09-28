import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Influencer } from "@/lib/types";
import type { Proposal } from "@/lib/campaign-detail-types";

export interface ProposalFull extends Proposal {
  campaign_influencer: { id: string; influencer: Influencer };
}

export async function getProposalsForCampaign(campaignId: string): Promise<ProposalFull[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, campaign_influencer:campaign_influencers!inner(id, influencer:influencers(*), campaign_id)")
    .eq("campaign_influencer.campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as never;
}
