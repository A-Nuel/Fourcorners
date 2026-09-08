import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0f172a",
        "surface-card": "#131e36",
        "surface-hover": "#1a2849",
        border: "#1e2d4d",
        bnb: "#F0B90B",
        "bnb-dark": "#c99904",
        altana: "#38bdf8",
        termix: "#a855f7",
        "category-rebalance": "#38bdf8",
        "category-grid": "#10b981",
        "category-yield": "#f59e0b",
        "category-health": "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(240, 185, 11, 0.15)",
        "glow-altana": "0 0 24px -4px rgba(56, 189, 248, 0.2)",
        "glow-termix": "0 0 24px -4px rgba(168, 85, 247, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
