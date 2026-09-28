import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import type { SavedDashboard } from "@/lib/campaign-detail-types";

export async function getSavedDashboards(): Promise<SavedDashboard[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("saved_dashboards").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
