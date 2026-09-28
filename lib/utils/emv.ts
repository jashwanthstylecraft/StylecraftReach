export function calculateEMV({
  likes = 0,
  comments = 0,
  views = 0,
  shares = 0,
}: {
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
}): number {
  return likes * 0.01 + comments * 0.1 + views * 0.003 + shares * 0.05;
}

export function formatEMV(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `USD ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `USD ${(value / 1_000).toFixed(2)}K`;
  return `USD ${value.toFixed(2)}`;
}
