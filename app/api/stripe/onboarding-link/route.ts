import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createConnectAccount, createOnboardingLink } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { influencerId } = (await req.json()) as { influencerId: string };
  if (!influencerId) return NextResponse.json({ error: "Missing influencerId" }, { status: 400 });

  const supabase = createServerClient();
  const { data: influencer, error } = await supabase
    .from("influencers")
    .select("id, email, stripe_account_id")
    .eq("id", influencerId)
    .single();

  if (error || !influencer) return NextResponse.json({ error: "Influencer not found" }, { status: 404 });

  let accountId = influencer.stripe_account_id;
  if (!accountId) {
    accountId = await createConnectAccount(influencerId, influencer.email);
    await supabase.from("influencers").update({ stripe_account_id: accountId }).eq("id", influencerId);
  }

  const url = await createOnboardingLink(accountId, influencerId);
  return NextResponse.json({ url });
}
