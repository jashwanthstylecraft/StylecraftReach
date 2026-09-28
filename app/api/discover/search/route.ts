import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { searchInfluencers } from "@/lib/modash/client";
import { recordSearchHistory } from "@/lib/actions";
import type { SearchFilters } from "@/lib/modash/types";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { filters, page } = (await req.json()) as { filters: SearchFilters; page: number };

  const results = await searchInfluencers(filters, page);

  if (page === 1) {
    recordSearchHistory(filters, results.length).catch(() => {});
  }

  return NextResponse.json({ results });
}
