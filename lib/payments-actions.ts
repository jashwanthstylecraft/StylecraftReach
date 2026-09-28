"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { createConnectAccount, MOCK_MODE } from "@/lib/stripe/client";
import type { PaymentType } from "@/lib/types";

// Mock-mode-only shortcut so the onboarding UI is fully testable without a
// real Stripe account — there's no real onboarding flow to complete without
// live keys, so this simulates what account.updated would otherwise do.
export async function simulateOnboardingComplete(influencerId: string) {
  auth().protect();
  if (!MOCK_MODE) throw new Error("Only available in mock mode");

  const supabase = createServerClient();
  const { data: influencer } = await supabase
    .from("influencers")
    .select("stripe_account_id, email")
    .eq("id", influencerId)
    .single();

  const accountId = influencer?.stripe_account_id ?? (await createConnectAccount(influencerId, influencer?.email ?? null));

  const { error } = await supabase
    .from("influencers")
    .update({
      stripe_account_id: accountId,
      stripe_onboarded: true,
      stripe_onboarded_at: new Date().toISOString(),
    })
    .eq("id", influencerId);
  if (error) throw error;

  revalidatePath("/payments");
  revalidatePath(`/payments/${influencerId}`);
}

export async function addFlatFeePayment(
  campaignInfluencerId: string,
  amount: number,
  description: string
) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("payments").insert({
    campaign_influencer_id: campaignInfluencerId,
    payment_type: "flat_fee" as PaymentType,
    amount,
    status: "pending",
    description,
  });
  if (error) throw error;
  revalidatePath("/payments");
}

export async function cancelScheduledPayment(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase
    .from("payment_schedule")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/payments");
}
