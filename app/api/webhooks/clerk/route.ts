import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface ClerkUserCreatedEvent {
  type: string;
  data: {
    id: string;
    public_metadata?: { influencer_id?: string; role?: string };
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (secret) {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
    }
    try {
      new Webhook(secret).verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(rawBody) as ClerkUserCreatedEvent;

  // Links a newly-created Clerk account back to the influencers row it was
  // invited for (public_metadata.influencer_id, set in /api/invite-influencer)
  // — this is what makes getPortalInfluencer() resolve for a real invited
  // user, not just the mock/manual-testing path.
  if (event.type === "user.created") {
    const influencerId = event.data.public_metadata?.influencer_id;
    if (influencerId) {
      const supabase = createServerClient();
      await supabase.from("influencers").update({ clerk_user_id: event.data.id }).eq("id", influencerId);
      await supabase
        .from("influencer_invitations")
        .update({
          status: "accepted",
          clerk_user_id: event.data.id,
          accepted_at: new Date().toISOString(),
        })
        .eq("influencer_id", influencerId)
        .eq("status", "pending");
    }
  }

  return NextResponse.json({ received: true });
}
