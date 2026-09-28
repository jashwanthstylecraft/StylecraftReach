"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ProposalDeliverable, ProposalStatus } from "@/lib/campaign-detail-types";

export async function createProposal(
  campaignInfluencerId: string,
  deliverables: ProposalDeliverable[],
  fee: number | null,
  notes: string
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("proposals").insert({
    campaign_influencer_id: campaignInfluencerId,
    deliverables,
    fee,
    notes: notes || null,
  });
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function sendProposal(proposalId: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", proposalId);
  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function setProposalStatus(proposalId: string, status: ProposalStatus) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("proposals")
    .update({ status, responded_at: status === "accepted" || status === "declined" ? new Date().toISOString() : null })
    .eq("id", proposalId);
  if (error) throw error;
  revalidatePath("/campaigns");
}
