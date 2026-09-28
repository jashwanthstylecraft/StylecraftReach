import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SOCIAL_APP_CONFIGURED } from "@/lib/social/config";

// Stubbed: no real Meta OAuth app is registered yet (needs META_APP_ID/META_APP_SECRET,
// a redirect URI on the deployed domain, and Instagram Graph API review). This
// endpoint exists so the settings page has something to link to and reports the
// real reason nothing happens, rather than faking a successful connection.
export async function GET(req: NextRequest) {
  auth().protect();
  const url = new URL("/settings/social-accounts", req.nextUrl.origin);
  url.searchParams.set("error", SOCIAL_APP_CONFIGURED.instagram ? "oauth_not_implemented" : "not_configured");
  url.searchParams.set("platform", "instagram");
  return NextResponse.redirect(url);
}
