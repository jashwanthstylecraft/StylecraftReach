import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AiScore, ModashProfile } from "@/lib/modash/types";
import { tierFromScore } from "@/lib/modash/types";

const MODEL = "claude-sonnet-5";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Used when ANTHROPIC_API_KEY isn't set yet, so the discovery UI is fully testable
// without a live key — a simple, deterministic stand-in for the real judgment call.
function mockScore(influencer: ModashProfile): AiScore {
  const engagementComponent = clamp(influencer.engagementRate * 8, 0, 35);
  const credibilityComponent = clamp(influencer.credibilityScore * 0.4, 0, 40);
  const audienceComponent = clamp(influencer.audience.genderSplit.male * 0.25, 0, 25);
  const score = Math.round(clamp(engagementComponent + credibilityComponent + audienceComponent, 0, 100));

  const isBarberingNiche = influencer.categories.some((c) =>
    /barber|groom|hair/i.test(c)
  );

  return {
    score,
    tier: tierFromScore(score),
    fitReason: isBarberingNiche
      ? `Strong niche alignment with ${influencer.engagementRate}% engagement and a ${influencer.credibilityScore}/100 credibility score.`
      : `Adjacent niche with ${influencer.engagementRate}% engagement — worth a closer look before committing budget.`,
    redFlags: influencer.credibilityScore < 65 ? ["Below-average credibility score — verify audience quality"] : [],
    suggestedCampaign: influencer.audience.genderSplit.male >= 60 ? "GAMMA+" : "Johnny B",
  };
}

function buildPrompt(influencer: ModashProfile, brand: string): string {
  return `You are a brand strategist for ${brand}, a professional hair tools and grooming brand.

Evaluate this influencer for a potential partnership and return a JSON score object.

Influencer data:
- Handle: ${influencer.username}
- Niche/Categories: ${influencer.categories.join(", ")}
- Bio: ${influencer.biography}
- Followers: ${influencer.followers.toLocaleString()}
- Engagement rate: ${influencer.engagementRate}%
- Credibility score: ${influencer.credibilityScore}/100
- Audience gender: ${influencer.audience.genderSplit.male}% male
- Top audience location: ${influencer.audience.topLocations[0]?.name ?? "Unknown"}

Brand context:
- Stylecraft and GAMMA+ target professional barbers, stylists, and grooming enthusiasts
- Johnny B targets lifestyle-oriented grooming consumers
- Ideal audience: 18-45 male, US-based, interested in barbering, grooming, hair styling
- Brand values: precision, craft, professional quality

Return ONLY valid JSON with no explanation:
{
  "score": <number 0-100>,
  "tier": <"S" | "A" | "B" | "C">,
  "fitReason": "<one sentence why they fit or don't>",
  "redFlags": ["<flag if any>"],
  "suggestedCampaign": "<Stylecraft | GAMMA+ | Johnny B>"
}`;
}

export async function scoreInfluencer(
  influencer: ModashProfile,
  brand = "StylecraftUS"
): Promise<AiScore> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockScore(influencer);
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: buildPrompt(influencer, brand) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return {
      score: clamp(Number(parsed.score) || 50, 0, 100),
      tier: parsed.tier ?? tierFromScore(parsed.score ?? 50),
      fitReason: parsed.fitReason ?? "Could not evaluate",
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      suggestedCampaign: parsed.suggestedCampaign ?? "Stylecraft",
    };
  } catch {
    return {
      score: 50,
      tier: "B",
      fitReason: "Could not evaluate",
      redFlags: [],
      suggestedCampaign: "Stylecraft",
    };
  }
}
