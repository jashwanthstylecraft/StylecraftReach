"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function saveCreatorPortalSettings(
  campaignId: string,
  settings: {
    showBrief: boolean;
    showDeliverables: boolean;
    showGifting: boolean;
    showEarnings: boolean;
    showOtherInfluencers: boolean;
    welcomeMessage: string;
  }
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("creator_portal_settings").upsert(
    {
      campaign_id: campaignId,
      show_brief: settings.showBrief,
      show_deliverables: settings.showDeliverables,
      show_gifting: settings.showGifting,
      show_earnings: settings.showEarnings,
      show_other_influencers: settings.showOtherInfluencers,
      welcome_message: settings.welcomeMessage.trim() || null,
    },
    { onConflict: "campaign_id" }
  );
  if (error) throw error;
  revalidatePath("/campaigns");
}
