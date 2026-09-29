import type { SocialPlatform } from "@/lib/affable-types";

export const SOCIAL_APP_CONFIGURED: Record<SocialPlatform, boolean> = {
  instagram: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
  // TikTok also needs ENCRYPTION_KEY — its OAuth tokens are real credentials
  // encrypted at rest (see lib/social/encryption.ts), unlike Instagram/YouTube
  // which are still stubbed and never store a real token.
  tiktok: Boolean(
    process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET && process.env.ENCRYPTION_KEY && process.env.NEXT_PUBLIC_APP_URL
  ),
  youtube: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};
