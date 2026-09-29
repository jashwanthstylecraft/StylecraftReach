import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { SOCIAL_APP_CONFIGURED } from "@/lib/social/config";
import { buildAuthorizeUrl } from "@/lib/social/tiktok";

const STATE_COOKIE = "tiktok_oauth_state";

export async function GET(req: NextRequest) {
  auth().protect();

  if (!SOCIAL_APP_CONFIGURED.tiktok) {
    const url = new URL("/settings/social-accounts", req.nextUrl.origin);
    url.searchParams.set("error", "not_configured");
    url.searchParams.set("platform", "tiktok");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(buildAuthorizeUrl(state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/api/social/connect/tiktok",
  });
  return res;
}
