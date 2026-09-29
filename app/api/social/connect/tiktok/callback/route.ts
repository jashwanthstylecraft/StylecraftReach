import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { encryptSecret } from "@/lib/social/encryption";
import { exchangeCodeForToken, getUserInfo } from "@/lib/social/tiktok";

const STATE_COOKIE = "tiktok_oauth_state";

export async function GET(req: NextRequest) {
  auth().protect();

  const settingsUrl = new URL("/settings/social-accounts", req.nextUrl.origin);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;

  function fail(reason: string) {
    settingsUrl.searchParams.set("error", reason);
    settingsUrl.searchParams.set("platform", "tiktok");
    const res = NextResponse.redirect(settingsUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  if (oauthError) return fail("oauth_denied");
  if (!code || !state || !expectedState || state !== expectedState) return fail("oauth_state_mismatch");

  try {
    const token = await exchangeCodeForToken(code);
    const user = await getUserInfo(token.access_token);

    const supabase = createServerClient();
    const { error } = await supabase.from("social_connections").upsert(
      {
        workspace_id: "default",
        platform: "tiktok",
        account_id: user.open_id,
        account_name: user.display_name,
        avatar_url: user.avatar_url,
        followers: user.follower_count,
        likes_count: user.likes_count,
        video_count: user.video_count,
        access_token: encryptSecret(token.access_token),
        refresh_token: encryptSecret(token.refresh_token),
        token_expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
        refresh_token_expires_at: new Date(Date.now() + token.refresh_expires_in * 1000).toISOString(),
        is_active: true,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id,platform,account_id" }
    );
    if (error) throw error;

    settingsUrl.searchParams.set("connected", "tiktok");
    const res = NextResponse.redirect(settingsUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch {
    return fail("oauth_exchange_failed");
  }
}
