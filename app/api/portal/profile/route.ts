import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Platform } from "@/lib/types";

interface ProfilePatchBody {
  handle?: string;
  platform?: Platform;
  niche?: string;
  location?: string;
  notes?: string; // used as "bio" in the portal UI
  email?: string;
}

export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json()) as ProfilePatchBody;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("influencers")
    .update(body)
    .eq("clerk_user_id", userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ influencer: data });
}
