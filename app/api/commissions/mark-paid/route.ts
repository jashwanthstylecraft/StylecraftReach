import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { campaignInfluencerId } = (await req.json()) as { campaignInfluencerId: string };
  if (!campaignInfluencerId) {
    return NextResponse.json({ error: "Missing campaignInfluencerId" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("conversions")
    .update({ commission_paid: true, commission_paid_at: new Date().toISOString() })
    .eq("campaign_influencer_id", campaignInfluencerId)
    .eq("commission_paid", false)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ updated: data.length });
}
