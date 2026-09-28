import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SOCIAL_APP_CONFIGURED } from "@/lib/social/config";

// Stubbed: no real TikTok for Developers app is registered yet (needs
// TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET and app review). Redirects back with
// the real reason rather than faking a successful connection.
export async function GET(req: NextRequest) {
  auth().protect();
  const url = new URL("/settings/social-accounts", req.nextUrl.origin);
  url.searchParams.set("error", SOCIAL_APP_CONFIGURED.tiktok ? "oauth_not_implemented" : "not_configured");
  url.searchParams.set("platform", "tiktok");
  return NextResponse.redirect(url);
}
