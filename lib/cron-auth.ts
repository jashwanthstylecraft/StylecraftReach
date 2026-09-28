import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/clerk-config";

// Cron routes are called by n8n (server-to-server), not a browser with a Clerk
// session, so they're exempted from Clerk in middleware.ts and instead gated
// by this shared-secret header.
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 501 });
  }
  if (req.headers.get("x-cron-secret") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Same routes also get a "run it now" button in the UI (e.g. StoryExpiryAlert) —
// since these routes are exempted from Clerk in middleware.ts, that manual
// trigger can't rely on a session already being enforced upstream, so this
// checks for one explicitly as the alternative to the cron secret.
export function requireCronSecretOrSignedIn(req: NextRequest): NextResponse | null {
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("x-cron-secret") === expected) return null;

  // auth() throws if clerkMiddleware never ran for this request, which is the
  // case whenever Clerk isn't configured (see middleware.ts) — treat that as
  // simply "no session" instead of letting it crash the route.
  if (isClerkConfigured) {
    const { userId } = auth();
    if (userId) return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
