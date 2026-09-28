"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

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
