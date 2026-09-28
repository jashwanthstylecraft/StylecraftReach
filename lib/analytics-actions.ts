"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("promo_codes").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
  revalidatePath("/promo-codes");
}

export async function revokeAffiliateLink(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("affiliate_links").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/links");
}
