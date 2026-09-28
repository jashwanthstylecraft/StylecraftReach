import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  conversionRateByCampaign,
  getPerformanceRows,
  platformSplit,
  revenueByInfluencer,
  summarizePerformance,
} from "@/lib/analytics-data";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);
  const campaignId = searchParams.get("campaignId") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;

  const rows = await getPerformanceRows({ days, campaignId, brand });

  return NextResponse.json({
    summary: summarizePerformance(rows),
    performanceRows: rows,
    revenueByInfluencer: revenueByInfluencer(rows),
    platformSplit: platformSplit(rows),
    conversionRateByCampaign: conversionRateByCampaign(rows),
  });
}
