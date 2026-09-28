import type {
  CompetitorAlert,
  RecommendedAction,
} from "@/lib/intelligence-types";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function renderDigestEmail({
  weekStart,
  weekEnd,
  headline,
  executiveSummary,
  recommendedActions,
  competitorAlerts,
}: {
  weekStart: Date;
  weekEnd: Date;
  headline: string;
  executiveSummary: string;
  recommendedActions: RecommendedAction[];
  competitorAlerts: CompetitorAlert[];
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F8FA; margin: 0; padding: 0; }
    .container { max-width: 640px; margin: 0 auto; background: white; }
    .header { background: #0A0A0B; padding: 32px; text-align: center; }
    .header h1 { color: #C8A96E; font-size: 24px; margin: 0; letter-spacing: -0.5px; }
    .header p { color: #9B9BA8; font-size: 13px; margin: 8px 0 0; }
    .headline { background: #C8A96E; color: #0A0A0B; padding: 20px 32px; font-size: 16px; font-weight: 600; }
    .section { padding: 24px 32px; border-bottom: 1px solid #E4E4EC; }
    .section h2 { font-size: 12px; font-weight: 600; color: #9B9BA8; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px; }
    .summary { font-size: 15px; color: #111114; line-height: 1.6; }
    .action-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F0F0F4; }
    .action-num { width: 24px; height: 24px; border-radius: 50%; background: #C8A96E; color: white; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .alert { background: #FEF2F2; border-left: 3px solid #EF4444; padding: 12px 16px; margin: 8px 0; border-radius: 0 4px 4px 0; }
    .footer { background: #0A0A0B; padding: 24px 32px; text-align: center; }
    .footer p { color: #5A5A68; font-size: 12px; margin: 4px 0; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>StylecraftReach</h1>
    <p>Weekly Intelligence Digest · ${formatDate(weekStart)} – ${formatDate(weekEnd)}</p>
  </div>

  <div class="headline">${headline}</div>

  <div class="section">
    <h2>Executive Summary</h2>
    <p class="summary">${executiveSummary}</p>
  </div>

  <div class="section">
    <h2>Recommended Actions</h2>
    ${recommendedActions
      .map(
        (a) => `
      <div class="action-item">
        <div class="action-num">${a.priority}</div>
        <div>
          <strong style="font-size:14px;color:#111114">${a.action}</strong>
          <p style="font-size:12px;color:#5A5A68;margin:4px 0 0">${a.reason}</p>
        </div>
      </div>
    `
      )
      .join("")}
  </div>

  ${
    competitorAlerts.length
      ? `
  <div class="section">
    <h2>Competitor Alerts</h2>
    ${competitorAlerts
      .map(
        (alert) => `
      <div class="alert">
        <strong>${alert.influencer}</strong> is also working with <strong>${alert.competitor}</strong>
        · Risk: ${alert.risk}
        <br><span style="font-size:12px;color:#6B7280">${alert.action}</span>
      </div>
    `
      )
      .join("")}
  </div>`
      : ""
  }

  <div class="footer">
    <p>StylecraftReach · StylecraftUS internal tool</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/intelligence" style="color:#C8A96E">View full digest &rarr;</a></p>
  </div>
</div>
</body>
</html>`;
}
