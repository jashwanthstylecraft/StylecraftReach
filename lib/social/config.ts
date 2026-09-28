import type { SocialPlatform } from "@/lib/affable-types";

export const SOCIAL_APP_CONFIGURED: Record<SocialPlatform, boolean> = {
  instagram: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
  tiktok: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
  youtube: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};
