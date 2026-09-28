"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type {
  CommunicationType,
  Platform,
  Stage,
} from "@/lib/types";
import type { AiScore, ModashProfile, SearchFilters } from "@/lib/modash/types";

async function requireActorEmail(): Promise<string> {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");
  const user = await currentUser();
  return user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team";
}

export async function updateCampaignInfluencerStage(
  campaignInfluencerId: string,
  stage: Stage
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("campaign_influencers")
    .update({ stage, stage_updated_at: new Date().toISOString() })
    .eq("id", campaignInfluencerId);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
}

interface CreateInfluencerInput {
  name: string;
  handle: string;
  platform: Platform;
  followers: number | null;
  email: string | null;
  location: string | null;
  niche: string | null;
  notes: string | null;
  ai_score: number | null;
  campaign_id?: string;
  stage?: Stage;
}

export async function createInfluencer(input: CreateInfluencerInput) {
  auth().protect();
  const supabase = createServerClient();

  const { data: influencer, error: influencerError } = await supabase
    .from("influencers")
    .insert({
      name: input.name,
      handle: input.handle,
      platform: input.platform,
      followers: input.followers,
      email: input.email,
      location: input.location,
      niche: input.niche,
      notes: input.notes,
      ai_score: input.ai_score,
    })
    .select()
    .single();
  if (influencerError) throw influencerError;

  if (input.campaign_id && input.stage) {
    const { error: linkError } = await supabase.from("campaign_influencers").insert({
      campaign_id: input.campaign_id,
      influencer_id: influencer.id,
      stage: input.stage,
    });
    if (linkError) throw linkError;
  }

  revalidatePath("/dashboard");
  revalidatePath("/influencers");
  revalidatePath("/campaigns");
  return influencer;
}

interface UpdateInfluencerInput {
  name: string;
  handle: string;
  platform: Platform;
  followers: number | null;
  engagement_rate: number | null;
  email: string | null;
  location: string | null;
  niche: string | null;
  notes: string | null;
  ai_score: number | null;
}

export async function updateInfluencer(id: string, input: UpdateInfluencerInput) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("influencers").update(input).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/influencers");
  revalidatePath(`/influencers/${id}`);
}

export async function addCommunication(
  campaignInfluencerId: string,
  type: CommunicationType,
  content: string
) {
  auth().protect();
  const createdBy = await requireActorEmail();
  const supabase = createServerClient();
  const { error } = await supabase.from("communications").insert({
    campaign_influencer_id: campaignInfluencerId,
    type,
    content,
    created_by: createdBy,
  });
  if (error) throw error;
  revalidatePath("/influencers");
}

export async function addDeliverable(
  campaignInfluencerId: string,
  description: string,
  dueDate: string | null
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("deliverables").insert({
    campaign_influencer_id: campaignInfluencerId,
    description,
    due_date: dueDate,
  });
  if (error) throw error;
  revalidatePath("/influencers");
}

export async function toggleDeliverable(
  deliverableId: string,
  completed: boolean,
  contentUrl?: string | null
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("deliverables")
    .update({ completed, content_url: contentUrl ?? null })
    .eq("id", deliverableId);
  if (error) throw error;
  revalidatePath("/influencers");
}

export async function addGift(
  campaignInfluencerId: string,
  productName: string,
  trackingNumber: string | null,
  shippedDate: string | null
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("gifts").insert({
    campaign_influencer_id: campaignInfluencerId,
    product_name: productName,
    tracking_number: trackingNumber,
    shipped_date: shippedDate,
  });
  if (error) throw error;
  revalidatePath("/influencers");
}

export async function toggleGiftDelivered(giftId: string, delivered: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("gifts")
    .update({ delivered })
    .eq("id", giftId);
  if (error) throw error;
  revalidatePath("/influencers");
}

export async function saveCreator(profile: ModashProfile, platform: Platform, score: AiScore) {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");
  const supabase = createServerClient();
  const { error } = await supabase.from("saved_creators").upsert(
    {
      user_id: userId,
      modash_user_id: profile.userId,
      platform,
      handle: profile.username,
      full_name: profile.fullName,
      profile_pic_url: profile.profilePicUrl,
      followers: profile.followers,
      engagement_rate: profile.engagementRate,
      ai_score: score.score,
      ai_tier: score.tier,
      ai_fit_reason: score.fitReason,
      raw_data: profile,
    },
    { onConflict: "user_id,modash_user_id,platform" }
  );
  if (error) throw error;
  revalidatePath("/discover/saved");
}

export async function removeSavedCreator(id: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");
  const supabase = createServerClient();
  const { error } = await supabase
    .from("saved_creators")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
  revalidatePath("/discover/saved");
}

export async function recordSearchHistory(filters: SearchFilters, resultCount: number) {
  const { userId } = auth();
  if (!userId) return;
  const supabase = createServerClient();
  await supabase.from("search_history").insert({
    user_id: userId,
    filters,
    result_count: resultCount,
  });
}
