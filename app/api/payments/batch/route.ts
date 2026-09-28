import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendPayout } from "@/lib/payments-send";
import type { PaymentType } from "@/lib/types";

interface BatchItem {
  campaignInfluencerId: string;
  paymentType: PaymentType;
  paymentId?: string;
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { items } = (await req.json()) as { items: BatchItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items to pay" }, { status: 400 });
  }

  const results = [];
  for (const item of items) {
    const result = await sendPayout(item);
    results.push({ campaignInfluencerId: item.campaignInfluencerId, ...result });
  }

  const succeeded = results.filter((r) => r.success).length;
  return NextResponse.json({ succeeded, failed: results.length - succeeded, results });
}
