import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAnalytics } from "@/lib/dub/client";

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const supabase = createServerClient();
  const { data: links, error } = await supabase.from("affiliate_links").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let updated = 0;
  for (const link of links) {
    try {
      const analytics = await getAnalytics(link.dub_link_id, "30d");
      await supabase
        .from("affiliate_links")
        .update({
          clicks: analytics.clicks,
          conversions: analytics.sales,
          revenue: analytics.saleAmount / 100,
          last_synced_at: new Date().toISOString(),
        })
        .eq("id", link.id);
      updated++;
    } catch {
      // Skip a link that fails to sync — the rest still get updated this run.
    }
  }

  return NextResponse.json({ updated, total: links.length });
}
