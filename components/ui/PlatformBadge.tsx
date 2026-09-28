import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLATFORM_STYLES: Record<Platform, { color: string; bg: string }> = {
  Instagram: { color: "#E4405F", bg: "rgba(228,64,95,0.12)" },
  TikTok: { color: "#00F2EA", bg: "rgba(0,242,234,0.12)" },
  YouTube: { color: "#FF0000", bg: "rgba(255,0,0,0.12)" },
  X: { color: "#E7E9EA", bg: "rgba(231,233,234,0.12)" },
};

export function platformAccentColor(platform: Platform): string {
  return PLATFORM_STYLES[platform].color;
}

export function PlatformBadge({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const style = PLATFORM_STYLES[platform];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
        className
      )}
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      {platform}
    </span>
  );
}
