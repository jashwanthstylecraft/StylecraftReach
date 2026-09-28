import type { Brand } from "@/lib/types";

const BRAND_ABBREVIATIONS: Record<Brand, string> = {
  Stylecraft: "SC",
  "GAMMA+": "GAMMA",
  "Johnny B": "JOHNNYB",
};

function currentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "SPRING";
  if (month >= 5 && month <= 7) return "SUMMER";
  if (month >= 8 && month <= 10) return "FALL";
  return "WINTER";
}

export function generateCodeSuggestions(
  handle: string,
  brand: Brand,
  discountValue: number
): string[] {
  const clean = handle.replace(/^@/, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const short = clean.slice(0, 8);

  return [
    `${short}${discountValue}`,
    `${BRAND_ABBREVIATIONS[brand]}${short}`,
    `${currentSeason()}${short}`,
  ];
}
