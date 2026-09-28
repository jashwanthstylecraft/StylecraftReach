import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Influencer } from "@/lib/types";
import type { Report } from "@/lib/affable-types";

export interface ReportFull extends Report {
  influencers: Influencer[];
}

export async function getReports(campaignId?: string): Promise<ReportFull[]> {
  const supabase = createServerClient();
  let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
  if (campaignId) query = query.eq("campaign_id", campaignId);
  const { data: reports, error } = await query;
  if (error) throw error;

  const allInfluencerIds = Array.from(new Set((reports ?? []).flatMap((r) => r.influencer_ids ?? [])));
  let influencersById = new Map<string, Influencer>();
  if (allInfluencerIds.length > 0) {
    const { data: influencers, error: infError } = await supabase
      .from("influencers")
      .select("*")
      .in("id", allInfluencerIds);
    if (infError) throw infError;
    influencersById = new Map((influencers ?? []).map((i) => [i.id, i]));
  }

  return (reports ?? []).map((r) => ({
    ...r,
    influencers: (r.influencer_ids ?? []).map((id: string) => influencersById.get(id)).filter(Boolean),
  })) as never;
}

export async function getReportById(id: string): Promise<ReportFull | null> {
  const supabase = createServerClient();
  const { data: report, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!report) return null;

  let influencers: Influencer[] = [];
  if ((report.influencer_ids ?? []).length > 0) {
    const { data, error: infError } = await supabase.from("influencers").select("*").in("id", report.influencer_ids);
    if (infError) throw infError;
    influencers = data ?? [];
  }

  return { ...report, influencers } as never;
}

export async function getReportsThisMonthCount(): Promise<number> {
  const supabase = createServerClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());
  if (error) throw error;
  return count ?? 0;
}
