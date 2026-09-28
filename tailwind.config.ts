import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-able tokens — values come from CSS custom properties in
        // globals.css so /light and /dark resolve to different colors from
        // the same class names, with Tailwind opacity modifiers (bg-gold/15)
        // still working via the rgb(var(...) / <alpha-value>) pattern.
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        platform: {
          instagram: "#E4405F",
          tiktok: "#00F2EA",
          youtube: "#FF0000",
          x: "#E7E9EA",
        },
        // Influencer portal (/portal/*) — deliberately lighter/friendlier than
        // the brand dashboard's dark theme; see Phase 5 design direction.
        portal: {
          bg: "#F8F8FA",
          surface: "#FFFFFF",
          border: "#E4E4EC",
          "text-primary": "#111114",
          "text-secondary": "#5A5A68",
          success: "#16A34A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
