import "server-only";
import { createServerClient } from "@/lib/supabase/server";

export interface CommunityCreatorStats {
  emv: number;
  lastContactedAt: string | null;
  status: "Active" | "Inactive";
}

export async function getCommunityCreatorStats(): Promise<Map<string, CommunityCreatorStats>> {
  const supabase = createServerClient();

  const [{ data: content, error: contentError }, { data: ciRows, error: ciError }] = await Promise.all([
    supabase.from("captured_content").select("influencer_id, emv"),
    supabase
      .from("campaign_influencers")
      .select("influencer_id, stage, communications(created_at)"),
  ]);
  if (contentError) throw contentError;
  if (ciError) throw ciError;

  const emvByInfluencer = new Map<string, number>();
  for (const row of content ?? []) {
    if (!row.influencer_id) continue;
    emvByInfluencer.set(row.influencer_id, (emvByInfluencer.get(row.influencer_id) ?? 0) + (row.emv ?? 0));
  }

  const statusByInfluencer = new Map<string, "Active" | "Inactive">();
  const lastContactedByInfluencer = new Map<string, string>();
  for (const row of ciRows ?? []) {
    const r = row as unknown as { influencer_id: string; stage: string; communications: { created_at: string }[] };
    if (r.stage === "Active") statusByInfluencer.set(r.influencer_id, "Active");
    for (const comm of r.communications ?? []) {
      const existing = lastContactedByInfluencer.get(r.influencer_id);
      if (!existing || comm.created_at > existing) lastContactedByInfluencer.set(r.influencer_id, comm.created_at);
    }
  }

  const result = new Map<string, CommunityCreatorStats>();
  const allIds = new Set([...Array.from(emvByInfluencer.keys()), ...Array.from(statusByInfluencer.keys()), ...Array.from(lastContactedByInfluencer.keys())]);
  Array.from(allIds).forEach((id) => {
    result.set(id, {
      emv: emvByInfluencer.get(id) ?? 0,
      lastContactedAt: lastContactedByInfluencer.get(id) ?? null,
      status: statusByInfluencer.get(id) ?? "Inactive",
    });
  });
  return result;
}
