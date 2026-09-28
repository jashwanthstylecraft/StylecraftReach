import "server-only";
import type { CreateLinkInput, DubAnalytics, DubLink, TrackSaleInput } from "./types";

export const MOCK_MODE = !process.env.DUB_API_KEY;

const SHORT_DOMAIN = "screach.link";

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function mockCreateLink(input: CreateLinkInput): DubLink {
  const seed = hashSeed(input.key);
  return {
    id: `dub_mock_${seed}`,
    shortLink: `https://${SHORT_DOMAIN}/${input.key}`,
    url: input.url,
    domain: SHORT_DOMAIN,
    key: input.key,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
}

function mockAnalytics(linkId: string, days: number): DubAnalytics {
  const seed = hashSeed(linkId);
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  const timeseries = Array.from({ length: days }, (_, i) => {
    const dayIndex = days - i;
    const clicks = Math.round(20 + rand(i) * 180);
    const sales = Math.round(rand(i + 100) * (clicks / 40));
    const saleAmount = sales * Math.round(3000 + rand(i + 200) * 6000);
    return {
      start: new Date(Date.now() - dayIndex * 24 * 60 * 60 * 1000).toISOString(),
      clicks,
      leads: Math.round(clicks * 0.08),
      sales,
      saleAmount,
    };
  });

  const totals = timeseries.reduce(
    (acc, day) => ({
      clicks: acc.clicks + day.clicks,
      leads: acc.leads + day.leads,
      sales: acc.sales + day.sales,
      saleAmount: acc.saleAmount + day.saleAmount,
    }),
    { clicks: 0, leads: 0, sales: 0, saleAmount: 0 }
  );

  return {
    ...totals,
    timeseries,
    countries: [
      { country: "US", clicks: Math.round(totals.clicks * 0.72) },
      { country: "CA", clicks: Math.round(totals.clicks * 0.12) },
      { country: "GB", clicks: Math.round(totals.clicks * 0.08) },
      { country: "AU", clicks: Math.round(totals.clicks * 0.05) },
      { country: "DE", clicks: Math.round(totals.clicks * 0.03) },
    ],
    devices: [
      { device: "Mobile", clicks: Math.round(totals.clicks * 0.68) },
      { device: "Desktop", clicks: Math.round(totals.clicks * 0.27) },
      { device: "Tablet", clicks: Math.round(totals.clicks * 0.05) },
    ],
    referers: [
      { referer: "instagram.com", clicks: Math.round(totals.clicks * 0.45) },
      { referer: "tiktok.com", clicks: Math.round(totals.clicks * 0.3) },
      { referer: "(direct)", clicks: Math.round(totals.clicks * 0.15) },
      { referer: "youtube.com", clicks: Math.round(totals.clicks * 0.1) },
    ],
  };
}

async function dubFetch(path: string, init: RequestInit) {
  const res = await fetch(`https://api.dub.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.DUB_API_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`Dub.co request failed: ${res.status}`);
  return res.json();
}

export async function createLink(input: CreateLinkInput): Promise<DubLink> {
  if (MOCK_MODE) return mockCreateLink(input);

  const workspaceQuery = process.env.DUB_WORKSPACE_ID
    ? `?workspaceId=${process.env.DUB_WORKSPACE_ID}`
    : "";
  return dubFetch(`/links${workspaceQuery}`, {
    method: "POST",
    body: JSON.stringify({
      url: input.url,
      domain: SHORT_DOMAIN,
      key: input.key,
      tags: input.tags,
      externalId: input.externalId,
      trackConversion: true,
      comments: input.comments,
    }),
  });
}

export async function getAnalytics(linkId: string, interval = "30d"): Promise<DubAnalytics> {
  const days = parseInt(interval, 10) || 30;
  if (MOCK_MODE) return mockAnalytics(linkId, days);

  return dubFetch(`/analytics?linkId=${linkId}&interval=${interval}&groupBy=timeseries`, {
    method: "GET",
  });
}

export async function trackSale(input: TrackSaleInput): Promise<void> {
  if (MOCK_MODE) return;

  await dubFetch("/track/sale", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
