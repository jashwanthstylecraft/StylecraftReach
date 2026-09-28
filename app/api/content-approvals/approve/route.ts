import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { notifyPortal } from "@/lib/portal-notify";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { submissionId } = (await req.json()) as { submissionId: string };
  if (!submissionId) return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });

  const supabase = createServerClient();

  const { data: submission, error: subError } = await supabase
    .from("content_submissions")
    .select(
      "*, campaign_influencer:campaign_influencers(id, influencer:influencers(handle, email), campaign:campaigns(name))"
    )
    .eq("id", submissionId)
    .single();

  if (subError || !submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const { error: updateSubError } = await supabase
    .from("content_submissions")
    .update({ status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (updateSubError) return NextResponse.json({ error: updateSubError.message }, { status: 500 });

  await supabase
    .from("deliverables")
    .update({ completed: true, content_url: submission.submitted_url })
    .eq("id", submission.deliverable_id);

  const { data: remaining } = await supabase
    .from("deliverables")
    .select("id, completed")
    .eq("campaign_influencer_id", submission.campaign_influencer_id);

  if ((remaining ?? []).every((d) => d.completed)) {
    await supabase
      .from("campaign_influencers")
      .update({ stage: "Completed", stage_updated_at: new Date().toISOString() })
      .eq("id", submission.campaign_influencer_id);
  }

  notifyPortal("content_approved", {
    influencerHandle: submission.campaign_influencer.influencer.handle,
    influencerEmail: submission.campaign_influencer.influencer.email,
    campaignName: submission.campaign_influencer.campaign.name,
  });

  return NextResponse.json({ success: true });
}
