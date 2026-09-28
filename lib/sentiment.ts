import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { SentimentAnalysis } from "@/lib/intelligence-types";

const MODEL = "claude-sonnet-5";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Used when ANTHROPIC_API_KEY isn't set, mirroring lib/ai-score.ts's mock fallback —
// a simple keyword-based stand-in so the content library UI is fully testable
// without a live key.
function mockSentiment(caption: string, comments: string[]): SentimentAnalysis {
  const text = `${caption} ${comments.join(" ")}`.toLowerCase();
  const positiveHits = ["love", "insane", "worth", "amazing", "changed my life", "smooth", "quiet"].filter((w) =>
    text.includes(w)
  ).length;
  const negativeHits = ["bad", "broke", "waste", "disappointed", "returned"].filter((w) => text.includes(w)).length;

  const score = clamp((positiveHits - negativeHits) * 25, -100, 100);
  const overallSentiment: SentimentAnalysis["overallSentiment"] =
    score > 20 ? "positive" : score < -20 ? "negative" : positiveHits > 0 && negativeHits > 0 ? "mixed" : "neutral";

  return {
    overallSentiment,
    sentimentScore: score,
    brandSentiment: score > 20 ? "positive" : score < -20 ? "negative" : "neutral",
    keyThemes: positiveHits > 0 ? ["product quality", "performance"] : ["general feedback"],
    redFlags: negativeHits > 0 ? ["Negative language detected in comments"] : [],
    quotableComment: comments[0] ?? "",
    summary:
      overallSentiment === "positive"
        ? "Audience response skews positive."
        : overallSentiment === "negative"
          ? "Audience response skews negative — review flagged comments."
          : "Audience response is mixed or neutral.",
  };
}

function buildPrompt(caption: string, comments: string[], platform: string, brand: string): string {
  return `Analyze the sentiment of this influencer post and its comments for ${brand} (a professional grooming brand).

Platform: ${platform}
Post caption: "${caption}"

Top comments:
${comments.slice(0, 20).map((c, i) => `${i + 1}. ${c}`).join("\n")}

Return ONLY valid JSON:
{
  "overallSentiment": "positive" | "neutral" | "negative" | "mixed",
  "sentimentScore": <number -100 to 100>,
  "brandSentiment": "positive" | "neutral" | "negative",
  "keyThemes": ["<theme1>", "<theme2>"],
  "redFlags": ["<flag if any>"],
  "quotableComment": "<the single best comment to screenshot/share>",
  "summary": "<one sentence summary of how the audience responded>"
}`;
}

export async function analyzeSentiment(
  caption: string,
  comments: string[],
  platform = "Instagram",
  brand = "StylecraftUS"
): Promise<SentimentAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return mockSentiment(caption, comments);
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: buildPrompt(caption, comments, platform, brand) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    return {
      overallSentiment: parsed.overallSentiment ?? "neutral",
      sentimentScore: clamp(Number(parsed.sentimentScore) || 0, -100, 100),
      brandSentiment: parsed.brandSentiment ?? "neutral",
      keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : [],
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
      quotableComment: parsed.quotableComment ?? "",
      summary: parsed.summary ?? "Analysis unavailable",
    };
  } catch {
    return {
      overallSentiment: "neutral",
      sentimentScore: 0,
      brandSentiment: "neutral",
      keyThemes: [],
      redFlags: [],
      quotableComment: "",
      summary: "Analysis unavailable",
    };
  }
}
