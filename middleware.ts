import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/portal/sign-in(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/webhook(.*)",
  "/api/cron(.*)",
  "/api/analyze-sentiment(.*)",
  // Required to be publicly viewable for TikTok's (and other OAuth providers')
  // app-review crawlers, which have no Clerk session.
  "/privacy-policy",
  "/terms-of-service",
]);

const isPortalRoute = createRouteMatcher(["/portal(.*)"]);

const withClerk = clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = auth();

  if (!userId) {
    const signInPath = isPortalRoute(req) ? "/portal/sign-in" : "/sign-in";
    return NextResponse.redirect(new URL(signInPath, req.url));
  }

  // See lib/clerk-role.ts — requires the `role` custom session claim to be
  // configured in the Clerk dashboard; defaults to "brand" until it is.
  const role = (sessionClaims as { role?: string } | null)?.role === "influencer" ? "influencer" : "brand";

  if (isPortalRoute(req) && role !== "influencer") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!isPortalRoute(req) && role === "influencer") {
    return NextResponse.redirect(new URL("/portal", req.url));
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Clerk isn't configured yet (no keys) — let requests through unauthenticated
  // instead of crashing, so the app is previewable before auth is wired up.
  // The moment both keys are set, this resumes gating every route as normal.
  if (!isClerkConfigured) {
    return NextResponse.next();
  }
  return withClerk(req, event);
}

export const config = {
  matcher: [
    // `.txt` covers domain-verification files (TikTok, Google Search Console,
    // etc.) served from public/ — these get fetched by external crawlers
    // with no Clerk session, so they must bypass auth like other static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|txt|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
