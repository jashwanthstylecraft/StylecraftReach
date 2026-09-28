"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ReportPlatform } from "@/lib/affable-types";

export async function createReport(
  name: string,
  platform: ReportPlatform,
  influencerIds: string[],
  postIds: string[] = [],
  campaignId: string | null = null
) {
  auth().protect();
  const user = await currentUser();
  const supabase = createServerClient();

  const { error } = await supabase.from("reports").insert({
    name,
    platform,
    influencer_ids: influencerIds,
    post_ids: postIds,
    post_count: postIds.length,
    created_by: user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team",
    campaign_id: campaignId,
  });
  if (error) throw error;
  revalidatePath("/reports");
  revalidatePath("/campaigns");
}

export async function deleteReports(ids: string[]) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("reports").delete().in("id", ids);
  if (error) throw error;
  revalidatePath("/reports");
}

export async function mergeReports(ids: string[], newName: string) {
  auth().protect();
  const user = await currentUser();
  const supabase = createServerClient();

  const { data: reports, error } = await supabase.from("reports").select("*").in("id", ids);
  if (error) throw error;

  const influencerIds = Array.from(new Set((reports ?? []).flatMap((r) => r.influencer_ids ?? [])));
  const postIds = Array.from(new Set((reports ?? []).flatMap((r) => r.post_ids ?? [])));
  const platform = (reports ?? []).every((r) => r.platform === reports?.[0]?.platform)
    ? reports?.[0]?.platform ?? "all"
    : "all";

  const { error: insertError } = await supabase.from("reports").insert({
    name: newName,
    platform,
    influencer_ids: influencerIds,
    post_ids: postIds,
    post_count: postIds.length,
    created_by: user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team",
  });
  if (insertError) throw insertError;
  revalidatePath("/reports");
}
