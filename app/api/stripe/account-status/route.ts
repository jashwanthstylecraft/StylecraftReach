import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAccountStatus } from "@/lib/stripe/client";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const influencerId = req.nextUrl.searchParams.get("influencerId");
  if (!influencerId) return NextResponse.json({ error: "Missing influencerId" }, { status: 400 });

  const supabase = createServerClient();
  const { data: influencer, error } = await supabase
    .from("influencers")
    .select("stripe_account_id")
    .eq("id", influencerId)
    .single();

  if (error || !influencer?.stripe_account_id) {
    return NextResponse.json({ chargesEnabled: false, payoutsEnabled: false });
  }

  const status = await getAccountStatus(influencer.stripe_account_id);

  if (status.payoutsEnabled) {
    await supabase
      .from("influencers")
      .update({ stripe_onboarded: true, stripe_onboarded_at: new Date().toISOString() })
      .eq("id", influencerId);
  }

  return NextResponse.json(status);
}
