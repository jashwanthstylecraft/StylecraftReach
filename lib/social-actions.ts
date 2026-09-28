"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

export async function disconnectSocialAccount(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("social_connections").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/settings/social-accounts");
}
