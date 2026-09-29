import "server-only";

const AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

// Login Kit scopes for the brand's own account stats — not creator discovery
// (that would need TikTok's Research API or a data provider, a separate,
// heavier approval process from what Login Kit grants).
const SCOPES = "user.info.basic,user.info.stats";

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL is not set — required as the exact TikTok redirect_uri");
  return `${base.replace(/\/$/, "")}/api/social/connect/tiktok/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    state,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

async function postForm(url: string, body: Record<string, string>): Promise<TikTokTokenResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams(body).toString(),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error_description ?? json.error ?? "TikTok token request failed");
  }
  return json as TikTokTokenResponse;
}

export function exchangeCodeForToken(code: string): Promise<TikTokTokenResponse> {
  return postForm(TOKEN_URL, {
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    code,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(),
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
  return postForm(TOKEN_URL, {
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    client_secret: process.env.TIKTOK_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export interface TikTokUserInfo {
  open_id: string;
  display_name: string;
  avatar_url: string;
  follower_count: number;
  likes_count: number;
  video_count: number;
}

export async function getUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const res = await fetch(
    `${USER_INFO_URL}?fields=open_id,display_name,avatar_url,follower_count,likes_count,video_count`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  if (!res.ok || json.error?.code !== "ok") {
    throw new Error(json.error?.message ?? "TikTok user info request failed");
  }
  return json.data.user as TikTokUserInfo;
}
