import type { DiscoveryPlatform, ModashProfile } from "./types";

interface MockEntry {
  platform: DiscoveryPlatform;
  profile: ModashProfile;
}

function posts(seed: number, count = 9) {
  return Array.from({ length: count }, (_, i) => ({
    url: `https://example.com/post/${seed}-${i}`,
    thumbnail: `https://picsum.photos/seed/sc-reach-${seed}-${i}/400/400`,
    likes: Math.round((800 + seed * 37 + i * 53) * (1 + (i % 3) * 0.2)),
    comments: Math.round((20 + seed * 3 + i * 4) * (1 + (i % 2) * 0.3)),
    date: new Date(Date.now() - (i + 1) * 4 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function audience(malePct: number, topLocation: string, seed: number) {
  return {
    genderSplit: { male: malePct, female: 100 - malePct },
    ageGroups: [
      { code: "18-24", value: 20 + (seed % 10) },
      { code: "25-34", value: 35 + (seed % 8) },
      { code: "35-44", value: 25 - (seed % 6) },
      { code: "45+", value: 20 - (seed % 5) },
    ],
    topLocations: [
      { name: topLocation, value: 38 + (seed % 12) },
      { name: "Canada", value: 12 + (seed % 5) },
      { name: "United Kingdom", value: 8 + (seed % 4) },
      { name: "Australia", value: 6 + (seed % 3) },
      { name: "Germany", value: 4 + (seed % 2) },
    ],
  };
}

interface Seed {
  platform: DiscoveryPlatform;
  username: string;
  fullName: string;
  followers: number;
  engagementRate: number;
  credibilityScore: number;
  biography: string;
  location: string;
  categories: string[];
  malePct: number;
}

const SEEDS: Seed[] = [
  { platform: "Instagram", username: "razor_ronnie", fullName: "Ronnie Castillo", followers: 412000, engagementRate: 4.6, credibilityScore: 91, biography: "Master barber. Precision fades. Booking link below.", location: "Los Angeles, CA", categories: ["Barbering", "Grooming"], malePct: 74 },
  { platform: "TikTok", username: "clipper.chronicles", fullName: "Devon Marsh", followers: 980000, engagementRate: 7.2, credibilityScore: 87, biography: "Daily cuts. Daily chaos. DM for collabs.", location: "Atlanta, GA", categories: ["Barbering", "Comedy"], malePct: 68 },
  { platform: "YouTube", username: "TheBeardScience", fullName: "Marcus Lee", followers: 156000, engagementRate: 3.1, credibilityScore: 94, biography: "Grooming science, product reviews, beard care tutorials.", location: "Chicago, IL", categories: ["Grooming", "Education"], malePct: 81 },
  { platform: "Instagram", username: "fadedbyfelix", fullName: "Felix Ortega", followers: 89000, engagementRate: 3.8, credibilityScore: 82, biography: "Barber. Denver based. Consistency over hype.", location: "Denver, CO", categories: ["Barbering"], malePct: 70 },
  { platform: "TikTok", username: "groomlikeapro", fullName: "Trevor Adams", followers: 623000, engagementRate: 6.4, credibilityScore: 76, biography: "Grooming tips for the modern man.", location: "Miami, FL", categories: ["Grooming", "Lifestyle"], malePct: 62 },
  { platform: "Instagram", username: "kingofcleanfades", fullName: "Andre King", followers: 275000, engagementRate: 4.1, credibilityScore: 90, biography: "Fades so clean they squeak. Houston.", location: "Houston, TX", categories: ["Barbering"], malePct: 77 },
  { platform: "YouTube", username: "HairTalkWithHugo", fullName: "Hugo Fernandez", followers: 67000, engagementRate: 2.9, credibilityScore: 88, biography: "Hair styling tutorials and product breakdowns.", location: "Miami, FL", categories: ["Hair styling", "Education"], malePct: 55 },
  { platform: "TikTok", username: "thebarberbench", fullName: "Jalen Brooks", followers: 341000, engagementRate: 5.9, credibilityScore: 69, biography: "Barbershop vlogs. New chair every week.", location: "Philadelphia, PA", categories: ["Barbering", "Lifestyle"], malePct: 66 },
  { platform: "Instagram", username: "sharpandsteady", fullName: "Malik Johnson", followers: 198000, engagementRate: 3.5, credibilityScore: 85, biography: "Steady hands, sharp lines. NYC barber.", location: "New York, NY", categories: ["Barbering", "Grooming"], malePct: 71 },
  { platform: "Instagram", username: "thecutcollective", fullName: "Omar Reyes", followers: 54000, engagementRate: 4.9, credibilityScore: 79, biography: "Independent barbershop collective. Austin.", location: "Austin, TX", categories: ["Barbering"], malePct: 64 },
  { platform: "TikTok", username: "dailydrip.grooming", fullName: "Chris Nolan", followers: 1450000, engagementRate: 8.1, credibilityScore: 58, biography: "Grooming + fashion. New drop every Friday.", location: "Las Vegas, NV", categories: ["Grooming", "Fashion"], malePct: 48 },
  { platform: "YouTube", username: "PrecisionCutsPodcast", fullName: "Terrence Wall", followers: 42000, engagementRate: 2.4, credibilityScore: 93, biography: "Long-form interviews with master barbers.", location: "Detroit, MI", categories: ["Barbering", "Education"], malePct: 83 },
  { platform: "Instagram", username: "graybeard.grooming", fullName: "Walter Simms", followers: 76000, engagementRate: 3.3, credibilityScore: 89, biography: "Classic grooming for the modern gentleman.", location: "Portland, OR", categories: ["Classic grooming"], malePct: 68 },
  { platform: "TikTok", username: "fadegameproper", fullName: "Isaiah Cole", followers: 512000, engagementRate: 6.8, credibilityScore: 73, biography: "Fade tutorials. Book me on the link.", location: "Charlotte, NC", categories: ["Barbering", "Education"], malePct: 60 },
  { platform: "Instagram", username: "thehairartisan", fullName: "Nina Alvarez", followers: 133000, engagementRate: 4.4, credibilityScore: 86, biography: "Hair art, creative color, editorial styling.", location: "San Francisco, CA", categories: ["Hair art", "Hair styling"], malePct: 32 },
  { platform: "YouTube", username: "BarbershopBusiness", fullName: "Reggie Thomas", followers: 29000, engagementRate: 2.1, credibilityScore: 95, biography: "Running and growing a barbershop, told straight.", location: "Dallas, TX", categories: ["Barbering", "Business"], malePct: 78 },
  { platform: "Instagram", username: "cleanlinesonly", fullName: "Bryan Ptak", followers: 61000, engagementRate: 3.7, credibilityScore: 84, biography: "Line-ups and low fades. Boston.", location: "Boston, MA", categories: ["Barbering"], malePct: 72 },
  { platform: "TikTok", username: "groomingwithgrace", fullName: "Grace Kim", followers: 287000, engagementRate: 5.3, credibilityScore: 81, biography: "Grooming isn't just for dudes. Unisex tips.", location: "Seattle, WA", categories: ["Grooming", "Lifestyle"], malePct: 41 },
  { platform: "Instagram", username: "the_lineup_lab", fullName: "Kevin Osei", followers: 145000, engagementRate: 4.0, credibilityScore: 92, biography: "Barbering education + product reviews.", location: "Washington, DC", categories: ["Barbering", "Education"], malePct: 69 },
  { platform: "YouTube", username: "JohnnyBStyle", fullName: "Jonathan Barry", followers: 51000, engagementRate: 2.7, credibilityScore: 90, biography: "Everyday grooming routines for busy guys.", location: "Nashville, TN", categories: ["Lifestyle grooming"], malePct: 65 },
];

export const MOCK_PROFILES: MockEntry[] = SEEDS.map((seed, i) => {
  const userId = `mock_${seed.platform.toLowerCase()}_${i + 1}`;
  const profile: ModashProfile = {
    userId,
    username: seed.username,
    fullName: seed.fullName,
    profilePicUrl: `https://i.pravatar.cc/300?u=${userId}`,
    followers: seed.followers,
    following: Math.round(seed.followers * 0.002) + 120,
    engagementRate: seed.engagementRate,
    avgLikes: Math.round(seed.followers * (seed.engagementRate / 100) * 0.85),
    avgComments: Math.round(seed.followers * (seed.engagementRate / 100) * 0.05),
    avgViews: seed.platform === "Instagram" ? null : Math.round(seed.followers * 1.8),
    credibilityScore: seed.credibilityScore,
    biography: seed.biography,
    email: i % 3 === 0 ? `${seed.username}@creatormail.com` : null,
    location: seed.location,
    language: "en",
    categories: seed.categories,
    audience: audience(seed.malePct, seed.location.split(", ")[1] === undefined ? "United States" : "United States", i),
    recentPosts: posts(i + 1),
  };
  return { platform: seed.platform, profile };
});

export function findMockProfile(platform: DiscoveryPlatform, userId: string): ModashProfile | null {
  return MOCK_PROFILES.find((p) => p.platform === platform && p.profile.userId === userId)?.profile ?? null;
}
