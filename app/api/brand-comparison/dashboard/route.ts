import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getBrandComparisonRows } from "@/lib/brand-comparison-data";
import { generateTrendsSeries, getTopPostsByBrand } from "@/lib/trends-dashboard-data";
import type { TrendsDashboardFilters } from "@/lib/affable-types";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const filters = (await req.json()) as TrendsDashboardFilters;
  if (!filters.brandIds || filters.brandIds.length === 0) {
    return NextResponse.json({ error: "Select at least one brand" }, { status: 400 });
  }

  const allRows = await getBrandComparisonRows();
  const comparisonRows = allRows.filter((r) => filters.brandIds.includes(r.brandId));
  const series = generateTrendsSeries(filters, allRows);
  const topPostsByBrand = await getTopPostsByBrand(filters.brandIds, filters.hashtagOrCaption, filters.sponsoredOnly);

  return NextResponse.json({ series, comparisonRows, topPostsByBrand });
}
