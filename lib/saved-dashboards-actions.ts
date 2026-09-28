"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { TrendsDashboardFilters } from "@/lib/affable-types";

export async function saveDashboard(name: string, filters: TrendsDashboardFilters) {
  auth().protect();
  const user = await currentUser();
  const supabase = createServerClient();
  const { error } = await supabase.from("saved_dashboards").insert({
    name,
    filters,
    created_by: user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "team",
  });
  if (error) throw error;
  revalidatePath("/brand-comparison");
}

export async function deleteSavedDashboard(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("saved_dashboards").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/brand-comparison");
}
