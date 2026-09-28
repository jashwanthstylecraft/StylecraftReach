import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { influencerId, email } = (await req.json()) as {
    influencerId: string;
    email: string;
  };

  if (!influencerId || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const invitation = await clerkClient().invitations.createInvitation({
    emailAddress: email,
    redirectUrl: `${appUrl}/portal/onboarding`,
    publicMetadata: {
      role: "influencer",
      influencer_id: influencerId,
    },
  });

  const supabase = createServerClient();
  const { error } = await supabase.from("influencer_invitations").insert({
    influencer_id: influencerId,
    clerk_invitation_id: invitation.id,
    email,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, invitationId: invitation.id });
}
