"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function createCommunityList(name: string, description: string, influencerIds: string[] = []) {
  auth().protect();
  const user = await currentUser();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("community_lists")
    .insert({
      name,
      description: description || null,
      influencer_ids: influencerIds,
      created_by: user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team",
    })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/community");
  return data.id as string;
}

export async function deleteCommunityList(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("community_lists").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/community");
}

export async function addInfluencersToList(listId: string, influencerIds: string[]) {
  auth().protect();
  const supabase = createServerClient();

  const { data: list, error } = await supabase.from("community_lists").select("influencer_ids").eq("id", listId).single();
  if (error) throw error;

  const merged = Array.from(new Set([...(list.influencer_ids ?? []), ...influencerIds]));
  const { error: updateError } = await supabase.from("community_lists").update({ influencer_ids: merged }).eq("id", listId);
  if (updateError) throw updateError;
  revalidatePath("/community");
  revalidatePath("/content-library");
}

export async function removeInfluencerFromList(listId: string, influencerId: string) {
  auth().protect();
  const supabase = createServerClient();

  const { data: list, error } = await supabase.from("community_lists").select("influencer_ids").eq("id", listId).single();
  if (error) throw error;

  const filtered = (list.influencer_ids ?? []).filter((id: string) => id !== influencerId);
  const { error: updateError } = await supabase.from("community_lists").update({ influencer_ids: filtered }).eq("id", listId);
  if (updateError) throw updateError;
  revalidatePath("/community");
}
