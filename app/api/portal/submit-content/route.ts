import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { deliverableId, campaignInfluencerId, submittedUrl, caption, notes } = (await req.json()) as {
    deliverableId: string;
    campaignInfluencerId: string;
    submittedUrl: string;
    caption?: string;
    notes?: string;
  };

  if (!deliverableId || !campaignInfluencerId || !submittedUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Ownership check — this campaign_influencer must belong to the signed-in influencer.
  const { data: ciData, error: ciError } = await supabase
    .from("campaign_influencers")
    .select("id, influencer:influencers(clerk_user_id)")
    .eq("id", campaignInfluencerId)
    .single();
  const ci = ciData as { id: string; influencer: { clerk_user_id: string | null } } | null;

  if (ciError || !ci || ci.influencer.clerk_user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: submission, error } = await supabase
    .from("content_submissions")
    .insert({
      deliverable_id: deliverableId,
      campaign_influencer_id: campaignInfluencerId,
      submitted_url: submittedUrl,
      caption: caption ?? null,
      notes: notes ?? null,
      status: "pending_review",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ submission });
}
