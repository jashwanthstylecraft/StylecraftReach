import "server-only";
import { MOCK_PROFILES, findMockProfile } from "./mock-data";
import type { DiscoveryPlatform, ModashProfile, SearchFilters, SearchResult } from "./types";

export const MOCK_MODE = !process.env.MODASH_API_KEY;

const PLATFORM_ENDPOINT: Record<DiscoveryPlatform, string> = {
  Instagram: "instagram",
  TikTok: "tiktok",
  YouTube: "youtube",
};

function matchesFilters(profile: ModashProfile, filters: SearchFilters): boolean {
  if (filters.followers.min !== null && profile.followers < filters.followers.min) return false;
  if (filters.followers.max !== null && profile.followers > filters.followers.max) return false;
  if (filters.engagementRateMin !== null && profile.engagementRate < filters.engagementRateMin) return false;
  if (filters.credibilityScoreMin !== null && profile.credibilityScore < filters.credibilityScoreMin) return false;
  if (filters.location && !profile.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
  if (filters.keyword) {
    const haystack = `${profile.biography} ${profile.categories.join(" ")} ${profile.username}`.toLowerCase();
    if (!haystack.includes(filters.keyword.toLowerCase())) return false;
  }
  if (filters.audienceGender === "male" && profile.audience.genderSplit.male < 55) return false;
  if (filters.audienceGender === "female" && profile.audience.genderSplit.female < 55) return false;
  if (filters.audienceAge.length > 0) {
    const hasOverlap = profile.audience.ageGroups.some(
      (g) => filters.audienceAge.includes(g.code) && g.value >= 15
    );
    if (!hasOverlap) return false;
  }
  return true;
}

function mockSearch(filters: SearchFilters, page: number, limit: number): SearchResult[] {
  const platforms = filters.platforms.length > 0 ? filters.platforms : (["Instagram", "TikTok", "YouTube"] as DiscoveryPlatform[]);
  const matches = MOCK_PROFILES.filter(
    (entry) => platforms.includes(entry.platform) && matchesFilters(entry.profile, filters)
  ).sort((a, b) => b.profile.followers - a.profile.followers);

  const start = (page - 1) * limit;
  return matches.slice(start, start + limit).map((entry) => ({ profile: entry.profile, platform: entry.platform }));
}

function buildModashRequestBody(filters: SearchFilters, page: number, limit: number) {
  return {
    filter: {
      influencer: {
        followers: { min: filters.followers.min ?? undefined, max: filters.followers.max ?? undefined },
        engagementRate: filters.engagementRateMin !== null ? { min: filters.engagementRateMin } : undefined,
        location: filters.location ? { name: filters.location } : undefined,
        language: "en",
        keywords: filters.keyword ? [filters.keyword] : undefined,
      },
      audience: {
        gender:
          filters.audienceGender === "any"
            ? undefined
            : { code: filters.audienceGender.toUpperCase(), min: 50 },
        age:
          filters.audienceAge.length > 0
            ? filters.audienceAge.map((code) => ({ code, min: 20 }))
            : undefined,
      },
    },
    sort: { field: "followers", direction: "desc" },
    limit,
    page,
  };
}

async function realSearch(
  platform: DiscoveryPlatform,
  filters: SearchFilters,
  page: number,
  limit: number
): Promise<SearchResult[]> {
  const res = await fetch(`https://api.modash.io/v1/${PLATFORM_ENDPOINT[platform]}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MODASH_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildModashRequestBody(filters, page, limit)),
  });
  if (!res.ok) throw new Error(`Modash search failed: ${res.status}`);
  const json = await res.json();
  const results: ModashProfile[] = json.results ?? json.data ?? [];
  return results.map((profile) => ({ profile, platform }));
}

export async function searchInfluencers(
  filters: SearchFilters,
  page: number,
  limit = 25
): Promise<SearchResult[]> {
  if (MOCK_MODE) return mockSearch(filters, page, limit);

  const platforms = filters.platforms.length > 0 ? filters.platforms : (["Instagram", "TikTok", "YouTube"] as DiscoveryPlatform[]);
  const perPlatformLimit = Math.ceil(limit / platforms.length);
  const results = await Promise.all(
    platforms.map((platform) => realSearch(platform, filters, page, perPlatformLimit))
  );
  return results.flat().slice(0, limit);
}

async function realGetProfile(platform: DiscoveryPlatform, userId: string): Promise<ModashProfile> {
  const res = await fetch(
    `https://api.modash.io/v1/${PLATFORM_ENDPOINT[platform]}/profile/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${process.env.MODASH_API_KEY}` } }
  );
  if (!res.ok) throw new Error(`Modash profile fetch failed: ${res.status}`);
  return res.json();
}

export async function getProfile(platform: DiscoveryPlatform, userId: string): Promise<ModashProfile | null> {
  if (MOCK_MODE) return findMockProfile(platform, userId);
  return realGetProfile(platform, userId);
}
