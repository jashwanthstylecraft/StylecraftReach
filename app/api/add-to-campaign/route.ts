import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ModashProfile } from "@/lib/modash/types";
import type { Platform } from "@/lib/types";

interface AddToCampaignBody {
  modashProfile: ModashProfile;
  campaignId: string;
  platform: Platform;
  aiScore: number;
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { modashProfile, campaignId, platform, aiScore } = (await req.json()) as AddToCampaignBody;

  if (!modashProfile || !campaignId || !platform) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: influencer, error: upsertError } = await supabase
    .from("influencers")
    .upsert(
      {
        name: modashProfile.fullName || modashProfile.username,
        handle: modashProfile.username,
        platform,
        followers: modashProfile.followers,
        engagement_rate: modashProfile.engagementRate,
        email: modashProfile.email,
        location: modashProfile.location,
        niche: modashProfile.categories?.join(", ") ?? null,
        avatar_url: modashProfile.profilePicUrl,
        ai_score: Math.round(aiScore),
        notes: modashProfile.biography,
      },
      { onConflict: "handle,platform" }
    )
    .select()
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  const { data: campaignInfluencer, error: linkError } = await supabase
    .from("campaign_influencers")
    .upsert(
      {
        campaign_id: campaignId,
        influencer_id: influencer.id,
        stage: "Shortlisted",
      },
      { onConflict: "campaign_id,influencer_id" }
    )
    .select()
    .single();

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    influencerId: influencer.id,
    campaignInfluencerId: campaignInfluencer.id,
  });
}
