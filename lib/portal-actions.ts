"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function updateNotificationPrefs(prefs: {
  email_on_payment: boolean;
  email_on_approval: boolean;
  email_on_deliverable: boolean;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean;
}) {
  const { userId } = auth();
  if (!userId) throw new Error("Not authenticated");

  const supabase = createServerClient();
  const { data: influencer } = await supabase
    .from("influencers")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!influencer) throw new Error("No linked influencer profile");

  const { error } = await supabase
    .from("influencer_notifications")
    .upsert({ influencer_id: influencer.id, ...prefs, updated_at: new Date().toISOString() }, { onConflict: "influencer_id" });
  if (error) throw error;

  revalidatePath("/portal/profile");
}
