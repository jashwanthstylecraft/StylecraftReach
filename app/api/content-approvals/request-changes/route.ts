import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { notifyPortal } from "@/lib/portal-notify";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { submissionId, feedback } = (await req.json()) as { submissionId: string; feedback: string };
  if (!submissionId || !feedback) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: submission, error: subError } = await supabase
    .from("content_submissions")
    .select(
      "*, campaign_influencer:campaign_influencers(influencer:influencers(handle, email), campaign:campaigns(name))"
    )
    .eq("id", submissionId)
    .single();

  if (subError || !submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const { error } = await supabase
    .from("content_submissions")
    .update({
      status: "needs_revision",
      feedback,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  notifyPortal("content_needs_revision", {
    influencerHandle: submission.campaign_influencer.influencer.handle,
    influencerEmail: submission.campaign_influencer.influencer.email,
    campaignName: submission.campaign_influencer.campaign.name,
    feedback,
  });

  return NextResponse.json({ success: true });
}
