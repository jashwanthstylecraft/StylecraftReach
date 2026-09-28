import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/webhook(.*)",
]);

const withClerk = clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
