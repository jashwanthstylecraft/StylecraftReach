import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createLink } from "@/lib/dub/client";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 24);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { campaignInfluencerId, destinationUrl } = (await req.json()) as {
    campaignInfluencerId: string;
    destinationUrl: string;
  };

  if (!campaignInfluencerId || !destinationUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: ci, error: ciError } = await supabase
    .from("campaign_influencers")
    .select("*, influencer:influencers(*), campaign:campaigns(*)")
    .eq("id", campaignInfluencerId)
    .maybeSingle();

  if (ciError || !ci) {
    return NextResponse.json({ error: "Campaign influencer not found" }, { status: 404 });
  }

  const key = `${slugify(ci.influencer.handle.replace(/^@/, ""))}-${slugify(ci.campaign.name)}`;

  const link = await createLink({
    url: destinationUrl,
    key,
    tags: [ci.campaign.id, ci.influencer.id],
    externalId: `${ci.influencer.id}-${ci.campaign.id}`,
    comments: `${ci.influencer.name} — ${ci.campaign.name}`,
  });

  const { data: affiliateLink, error: insertError } = await supabase
    .from("affiliate_links")
    .insert({
      campaign_influencer_id: campaignInfluencerId,
      dub_link_id: link.id,
      short_link: link.shortLink,
      destination_url: destinationUrl,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      last_synced_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ affiliateLink });
}
