"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ActionTaken } from "@/lib/intelligence-types";

export async function toggleContentFeatured(id: string, featured: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("captured_content").update({ featured }).eq("id", id);
  if (error) throw error;
  revalidatePath("/content-library");
}

export async function toggleContentApproved(id: string, approved: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("captured_content").update({ approved_by_brand: approved }).eq("id", id);
  if (error) throw error;
  revalidatePath("/content-library");
}

export async function actionMention(id: string, action: ActionTaken) {
  auth().protect();
  const supabase = createServerClient();

  if (action === "added_to_crm") {
    const { data: mention, error: mentionError } = await supabase
      .from("brand_mentions")
      .select("*")
      .eq("id", id)
      .single();
    if (mentionError) throw mentionError;

    await supabase
      .from("influencers")
      .upsert(
        {
          name: mention.author_handle.replace(/^@/, ""),
          handle: mention.author_handle,
          platform: mention.platform,
          followers: mention.author_followers,
          notes: `Discovered via brand mention monitoring (${mention.matched_keyword}).`,
        },
        { onConflict: "handle,platform" }
      );
  }

  const { error } = await supabase
    .from("brand_mentions")
    .update({ actioned: true, action_taken: action })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/mentions");
  revalidatePath("/influencers");
}

export async function toggleMentionSaved(id: string, saved: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("brand_mentions").update({ saved }).eq("id", id);
  if (error) throw error;
  revalidatePath("/mentions");
}

export async function sendDigestEmail(digestId: string) {
  auth().protect();
  const supabase = createServerClient();

  const { data: digest, error } = await supabase
    .from("intelligence_digests")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", digestId)
    .select()
    .single();
  if (error) throw error;

  // Resend isn't installed in this project (same note as every earlier phase) —
  // handing the rendered email off to n8n's own Resend step, same as
  // app/api/cron/generate-digest/route.ts, rather than sending it directly.
  if (process.env.N8N_DIGEST_GENERATE_WEBHOOK) {
    fetch(process.env.N8N_DIGEST_GENERATE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        digestId: digest.id,
        headline: digest.headline,
        emailHtml: digest.email_html,
        recipients: process.env.DIGEST_EMAIL_RECIPIENTS?.split(",").map((e: string) => e.trim()) ?? [],
      }),
    }).catch(() => {});
  }

  revalidatePath("/intelligence");
  revalidatePath(`/intelligence/${digestId}`);
}

export async function toggleCompetitorAlert(id: string, enabled: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("competitor_overlap").update({ alert_enabled: enabled }).eq("id", id);
  if (error) throw error;
  revalidatePath("/competitor-overlap");
}
