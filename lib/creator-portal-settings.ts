import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { CreatorPortalSettings } from "@/lib/campaign-detail-types";

export async function getCreatorPortalSettings(campaignId: string): Promise<CreatorPortalSettings | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("creator_portal_settings")
    .select("*")
    .eq("campaign_id", campaignId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
