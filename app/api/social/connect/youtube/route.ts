import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SOCIAL_APP_CONFIGURED } from "@/lib/social/config";

// Stubbed: no real Google Cloud OAuth client is registered yet (needs
// GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET and YouTube Data API consent screen
// verification). Redirects back with the real reason rather than faking a
// successful connection.
export async function GET(req: NextRequest) {
  auth().protect();
  const url = new URL("/settings/social-accounts", req.nextUrl.origin);
  url.searchParams.set("error", SOCIAL_APP_CONFIGURED.youtube ? "oauth_not_implemented" : "not_configured");
  url.searchParams.set("platform", "youtube");
  return NextResponse.redirect(url);
}
