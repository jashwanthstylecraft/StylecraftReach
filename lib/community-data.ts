import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { Influencer } from "@/lib/types";
import type { CommunityList } from "@/lib/affable-types";

export interface CommunityListFull extends CommunityList {
  influencers: Influencer[];
}

export async function getCommunityLists(): Promise<CommunityListFull[]> {
  const supabase = createServerClient();
  const { data: lists, error } = await supabase
    .from("community_lists")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const allIds = Array.from(new Set((lists ?? []).flatMap((l) => l.influencer_ids ?? [])));
  let byId = new Map<string, Influencer>();
  if (allIds.length > 0) {
    const { data: influencers, error: infError } = await supabase.from("influencers").select("*").in("id", allIds);
    if (infError) throw infError;
    byId = new Map((influencers ?? []).map((i) => [i.id, i]));
  }

  return (lists ?? []).map((l) => ({
    ...l,
    influencers: (l.influencer_ids ?? []).map((id: string) => byId.get(id)).filter(Boolean),
  })) as never;
}
