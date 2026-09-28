import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { generateDigestForWeek } from "@/lib/digest-generation";

export async function POST(req: NextRequest) {
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  const digest = await generateDigestForWeek();

  if (process.env.N8N_DIGEST_GENERATE_WEBHOOK) {
    fetch(process.env.N8N_DIGEST_GENERATE_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        digestId: digest.id,
        headline: digest.headline,
        weekStart: digest.week_start,
        weekEnd: digest.week_end,
        emailHtml: digest.email_html,
        recipients: process.env.DIGEST_EMAIL_RECIPIENTS?.split(",").map((e) => e.trim()) ?? [],
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ digestId: digest.id, headline: digest.headline });
}
