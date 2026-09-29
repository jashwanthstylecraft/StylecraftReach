"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { decryptSecret, encryptSecret } from "@/lib/social/encryption";
import { getUserInfo, refreshAccessToken } from "@/lib/social/tiktok";

export async function disconnectSocialAccount(id: string) {
  auth().protect();
  const supabase = createServerClient();
  const { error } = await supabase.from("social_connections").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/settings/social-accounts");
}

export async function syncTikTokConnection(id: string) {
  auth().protect();
  const supabase = createServerClient();

  const { data: connection, error: fetchError } = await supabase
    .from("social_connections")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw fetchError;

  let accessToken = decryptSecret(connection.access_token);
  let refreshToken = connection.refresh_token;
  let tokenExpiresAt = connection.token_expires_at;
  let refreshTokenExpiresAt = connection.refresh_token_expires_at;

  const accessExpired = new Date(connection.token_expires_at).getTime() < Date.now() + 60_000;
  if (accessExpired) {
    const refreshed = await refreshAccessToken(decryptSecret(connection.refresh_token));
    accessToken = refreshed.access_token;
    refreshToken = encryptSecret(refreshed.refresh_token);
    tokenExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    refreshTokenExpiresAt = new Date(Date.now() + refreshed.refresh_expires_in * 1000).toISOString();
  }

  const user = await getUserInfo(accessToken);

  const { error: updateError } = await supabase
    .from("social_connections")
    .update({
      account_name: user.display_name,
      avatar_url: user.avatar_url,
      followers: user.follower_count,
      likes_count: user.likes_count,
      video_count: user.video_count,
      refresh_token: refreshToken,
      token_expires_at: tokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) throw updateError;
  revalidatePath("/settings/social-accounts");
}
