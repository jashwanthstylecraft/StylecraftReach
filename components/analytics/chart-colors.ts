// Chart-fill colors, distinct from the small brand-color platform badges elsewhere
// in the app: validated (dataviz skill, --surface #111114 --mode dark) as a safe
// categorical set. The platform brand hexes (Instagram pink, TikTok cyan, ...) fail
// CVD separation and the normal-vision floor when used as large chart fills, so they
// stay reserved for the tiny PlatformBadge text chip.
export const LINE_CHART_COLORS = {
  clicks: "#3987e5",
  conversions: "#199e70",
};

export const CHART_PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#3987e5",
  TikTok: "#d95926",
  YouTube: "#199e70",
  X: "#c98500",
};

export const TOOLTIP_STYLE = {
  backgroundColor: "#1A1A1F",
  border: "1px solid #2A2A32",
  borderRadius: 6,
  fontSize: 12,
  color: "#F4F4F5",
};
