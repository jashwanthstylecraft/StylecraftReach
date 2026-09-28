import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/clerk-role";
import { notifyPortal } from "@/lib/portal-notify";

async function assertAccess(campaignInfluencerId: string, userId: string, role: "brand" | "influencer") {
  if (role === "brand") return true;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("campaign_influencers")
    .select("influencer:influencers(clerk_user_id)")
    .eq("id", campaignInfluencerId)
    .single();
  const row = data as { influencer: { clerk_user_id: string | null } } | null;
  return row?.influencer.clerk_user_id === userId;
}

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const campaignInfluencerId = req.nextUrl.searchParams.get("campaignInfluencerId");
  if (!campaignInfluencerId) {
    return NextResponse.json({ error: "Missing campaignInfluencerId" }, { status: 400 });
  }

  const role = getUserRole();
  if (!(await assertAccess(campaignInfluencerId, userId, role))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("portal_messages")
    .select("*")
    .eq("campaign_influencer_id", campaignInfluencerId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { campaignInfluencerId, content } = (await req.json()) as {
    campaignInfluencerId: string;
    content: string;
  };
  if (!campaignInfluencerId || !content?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const role = getUserRole();
  if (!(await assertAccess(campaignInfluencerId, userId, role))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await currentUser();
  const senderName =
    role === "brand"
      ? user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Stylecraft team"
      : user?.fullName ?? "You";

  const supabase = createServerClient();
  const { data: message, error } = await supabase
    .from("portal_messages")
    .insert({
      campaign_influencer_id: campaignInfluencerId,
      sender_role: role,
      sender_id: userId,
      sender_name: senderName,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: ciData } = await supabase
    .from("campaign_influencers")
    .select("influencer:influencers(handle, email), campaign:campaigns(name)")
    .eq("id", campaignInfluencerId)
    .single();
  const ci = ciData as {
    influencer: { handle: string; email: string | null };
    campaign: { name: string };
  } | null;

  if (ci) {
    notifyPortal("new_message", {
      senderRole: role,
      senderName,
      influencerHandle: ci.influencer.handle,
      influencerEmail: ci.influencer.email,
      campaignName: ci.campaign.name,
      content: content.trim(),
    });
  }

  return NextResponse.json({ message });
}
