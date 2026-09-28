import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDailyStatsForCampaignInfluencer, getTimeseries } from "@/lib/analytics-data";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);
  const influencerId = searchParams.get("influencerId");

  if (influencerId) {
    const stats = await getDailyStatsForCampaignInfluencer(influencerId, days);
    return NextResponse.json({
      timeseries: stats.map((s) => ({
        date: s.date,
        clicks: s.clicks,
        conversions: s.conversions,
        revenue: Number(s.revenue),
      })),
    });
  }

  const campaignId = searchParams.get("campaignId") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const timeseries = await getTimeseries({ days, campaignId, brand });
  return NextResponse.json({ timeseries });
}
