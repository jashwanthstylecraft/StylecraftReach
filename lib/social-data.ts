import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SocialConnection } from "@/lib/affable-types";

export async function getSocialConnections(workspaceId = "default"): Promise<SocialConnection[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("social_connections")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("connected_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
