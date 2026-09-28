import "server-only";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/clerk-config";

export type UserRole = "brand" | "influencer";

// Defaults to "brand" when Clerk isn't configured, or when the `role` custom
// session claim hasn't been added yet in the Clerk dashboard (Sessions ->
// Customize session token -> add { "role": "{{user.public_metadata.role}}" })
// — this keeps the existing brand dashboard usable before that one-time
// manual step is done, rather than breaking every page.
export function getUserRole(): UserRole {
  if (!isClerkConfigured) return "brand";
  const { sessionClaims } = auth();
  const role = (sessionClaims as { role?: string } | null)?.role;
  return role === "influencer" ? "influencer" : "brand";
}
