import "server-only";
import { MOCK_MODE } from "./client";
import type { DiscoveryPlatform, ModashHashtagAnalytics, ModashMentionResult, ModashPost } from "./types";

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MOCK_COMMENTS = [
  "This clipper changed my life fr fr",
  "been using wahl for 10 years and this might replace it",
  "the battery life is actually insane",
  "how much was this",
  "need this in my kit asap",
  "zero gap adjustment is so smooth",
  "quietest clipper i've ever used",
  "worth every penny honestly",
];

const MOCK_CAPTIONS = [
  "The battery on this thing is unreal. 3 hours, zero drop-off.",
  "zero-gap adjustment on the new one is actually insane",
  "whisper quiet and still cuts through thick hair no problem",
  "client asked what clipper I use — told them, they bought one same day",
];

export async function getModashPosts(
  identifier: string,
  platform: DiscoveryPlatform,
  options: { storiesOnly?: boolean; limit?: number } = {}
): Promise<ModashPost[]> {
  if (!MOCK_MODE) {
    // Real Modash content endpoints aren't wired up — Modash's public API docs don't
    // document a stable posts/videos endpoint shape as of this build, so real mode
    // intentionally throws rather than guessing a request shape that would silently
    // return nothing.
    throw new Error("Live Modash content capture isn't implemented — set MOCK_MODE (unset MODASH_API_KEY) to test.");
  }

  const limit = options.limit ?? 10;
  const seed = hashSeed(identifier + platform);
  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  const count = options.storiesOnly ? Math.floor(pseudoRandom(seed) * 3) : limit;
  const posts: ModashPost[] = [];

  for (let i = 0; i < count; i++) {
    const postSeed = seed + i * 97 + dayBucket;
    const isStory = options.storiesOnly ?? pseudoRandom(postSeed) < 0.15;
    const postedHoursAgo = isStory ? pseudoRandom(postSeed + 1) * 20 : pseudoRandom(postSeed + 1) * 24 * 10;
    const postedAt = new Date(Date.now() - postedHoursAgo * 60 * 60 * 1000);
    const views = Math.round(5000 + pseudoRandom(postSeed + 2) * 280000);

    posts.push({
      id: `mock_post_${identifier}_${dayBucket}_${i}`,
      url: `https://example.com/${platform.toLowerCase()}/p/${identifier}-${dayBucket}-${i}`,
      thumbnailUrl: `https://picsum.photos/seed/content-${identifier}-${i}/400/400`,
      mediaType: isStory ? "story" : (["reel", "video", "image", "carousel"] as const)[i % 4],
      caption: MOCK_CAPTIONS[Math.floor(pseudoRandom(postSeed + 3) * MOCK_CAPTIONS.length)],
      likes: Math.round(views * (0.04 + pseudoRandom(postSeed + 4) * 0.05)),
      comments: Math.round(views * (0.002 + pseudoRandom(postSeed + 5) * 0.006)),
      views,
      shares: Math.round(views * 0.001),
      postedAt: postedAt.toISOString(),
      isStory,
      expiresAt: isStory
        ? new Date(postedAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      topComments: Array.from({ length: 5 }, (_, c) => MOCK_COMMENTS[(i + c) % MOCK_COMMENTS.length]),
    });
  }

  return posts;
}

export async function searchMentions(
  keywords: string[],
  platforms: DiscoveryPlatform[]
): Promise<ModashMentionResult[]> {
  if (!MOCK_MODE) {
    throw new Error("Live Modash mention search isn't implemented — unset MODASH_API_KEY to test in mock mode.");
  }

  const dayBucket = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const results: ModashMentionResult[] = [];

  keywords.forEach((keyword, ki) => {
    const seed = hashSeed(keyword) + dayBucket;
    if (pseudoRandom(seed) > 0.6) return; // not every keyword produces a new mention every run

    const platform = platforms[Math.floor(pseudoRandom(seed + 1) * platforms.length)] ?? platforms[0];
    const followers = Math.round(1000 + pseudoRandom(seed + 2) * 90000);

    results.push({
      postUrl: `https://example.com/${platform.toLowerCase()}/mention-${hashSeed(keyword)}-${dayBucket}`,
      authorHandle: `@creator_${hashSeed(keyword + ki).toString(36).slice(0, 6)}`,
      authorFollowers: followers,
      platform,
      caption: MOCK_CAPTIONS[ki % MOCK_CAPTIONS.length],
      thumbnailUrl: `https://picsum.photos/seed/mention-${hashSeed(keyword)}/400/400`,
      likes: Math.round(followers * 0.03),
      comments: Math.round(followers * 0.004),
      views: Math.round(followers * 1.4),
      matchedKeyword: keyword,
      postedAt: new Date(Date.now() - pseudoRandom(seed + 3) * 48 * 60 * 60 * 1000).toISOString(),
    });
  });

  return results;
}

export async function getHashtagAnalytics(hashtag: string): Promise<ModashHashtagAnalytics> {
  if (!MOCK_MODE) {
    throw new Error("Live Modash hashtag analytics isn't implemented — unset MODASH_API_KEY to test in mock mode.");
  }

  const seed = hashSeed(hashtag);
  const postCount = Math.round(200 + pseudoRandom(seed) * 1200);

  return {
    hashtag,
    postCount,
    totalReach: Math.round(postCount * (5000 + pseudoRandom(seed + 1) * 20000)),
    avgEngagement: Math.round((2 + pseudoRandom(seed + 2) * 4) * 100) / 100,
  };
}
