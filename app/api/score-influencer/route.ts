import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { scoreInfluencer } from "@/lib/ai-score";
import type { ModashProfile } from "@/lib/modash/types";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { influencer, brand } = (await req.json()) as {
    influencer: ModashProfile;
    brand?: string;
  };

  if (!influencer) {
    return NextResponse.json({ error: "Missing influencer" }, { status: 400 });
  }

  const result = await scoreInfluencer(influencer, brand);
  return NextResponse.json(result);
}
