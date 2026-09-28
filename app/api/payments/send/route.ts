import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendPayout } from "@/lib/payments-send";
import type { PaymentType } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { campaignInfluencerId, paymentType, paymentId } = (await req.json()) as {
    campaignInfluencerId: string;
    paymentType: PaymentType;
    paymentId?: string;
  };

  if (!campaignInfluencerId || !paymentType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await sendPayout({ campaignInfluencerId, paymentType, paymentId });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
