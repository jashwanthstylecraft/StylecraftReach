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
        background: "#0A0A0B",
        surface: "#111114",
        "surface-elevated": "#1A1A1F",
        border: "#2A2A32",
        gold: "#C8A96E",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-primary": "#F4F4F5",
        "text-secondary": "#9B9BA8",
        "text-muted": "#5A5A68",
        platform: {
          instagram: "#E4405F",
          tiktok: "#00F2EA",
          youtube: "#FF0000",
          x: "#E7E9EA",
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
