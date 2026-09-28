"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { Brand, InvitationDisplayStatus, Platform } from "@/lib/types";

interface CreateCampaignInput {
  name: string;
  brand: Brand;
  budget: number | null;
  budgetLabel: string | null;
  platform: Platform;
  startDate: string | null;
  trackedHashtags: string[];
  trackedMentions: string[];
  welcomeMessage: string;
}

export async function createCampaign(input: CreateCampaignInput) {
  auth().protect();
  const supabase = createServerClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name: input.name,
      brand: input.brand,
      status: "draft",
      budget: input.budget,
      budget_label: input.budgetLabel,
      spend: 0,
      start_date: input.startDate,
      tracked_hashtags: input.trackedHashtags,
      tracked_mentions: input.trackedMentions,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (input.welcomeMessage.trim()) {
    const { error: settingsError } = await supabase.from("creator_portal_settings").insert({
      campaign_id: campaign.id,
      welcome_message: input.welcomeMessage.trim(),
    });
    if (settingsError) throw settingsError;
  }

  revalidatePath("/campaigns");
  return campaign.id as string;
}

export async function setAffiliateCode(campaignInfluencerId: string, code: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("campaign_influencers")
    .update({ affiliate_code: code.trim() || null })
    .eq("id", campaignInfluencerId);
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function setAssignee(campaignInfluencerId: string, assigneeName: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("campaign_influencers")
    .update({ assignee_name: assigneeName.trim() || null })
    .eq("id", campaignInfluencerId);
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function setInvitationStatus(campaignInfluencerId: string, status: InvitationDisplayStatus) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("campaign_influencers").update({ status }).eq("id", campaignInfluencerId);
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function addExistingInfluencerToCampaign(campaignId: string, influencerId: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("campaign_influencers")
    .upsert({ campaign_id: campaignId, influencer_id: influencerId, stage: "Shortlisted" }, { onConflict: "campaign_id,influencer_id" });
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function addInfluencersToCampaign(campaignId: string, influencerIds: string[]) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("campaign_influencers").upsert(
    influencerIds.map((influencerId) => ({ campaign_id: campaignId, influencer_id: influencerId, stage: "Shortlisted" })),
    { onConflict: "campaign_id,influencer_id" }
  );
  if (error) throw error;
  revalidatePath("/campaigns");
  revalidatePath("/community");
}

export async function duplicateCampaign(campaignId: string) {
  auth().protect();
  const supabase = createServerClient();

  const { data: source, error } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();
  if (error) throw error;

  const { error: insertError } = await supabase.from("campaigns").insert({
    name: `${source.name} (copy)`,
    brand: source.brand,
    status: "draft",
    budget: source.budget,
    spend: 0,
    start_date: source.start_date,
    end_date: source.end_date,
    brief: source.brief,
    tracked_hashtags: source.tracked_hashtags,
    tracked_mentions: source.tracked_mentions,
    budget_label: source.budget_label,
  });
  if (insertError) throw insertError;
  revalidatePath("/campaigns");
}
