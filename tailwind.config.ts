import type { Config } from "tailwindcss";

/* Semantic colours are backed by the CSS variables in app/globals.css so the
   token system has a single source of truth (mirrors the LACE learning-hub). */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutral base
        paper: "var(--paper)",
        panel: "var(--panel)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          soft: "var(--ink-soft)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
          soft: "var(--line-soft)",
        },
        hover: "var(--hover)",
        // Dark sidebar rail (design handoff v3)
        sb: {
          DEFAULT: "var(--sb)",
          ink: "var(--sb-ink)",
          muted: "var(--sb-muted)",
          hover: "var(--sb-hover)",
          active: "var(--sb-active)",
          line: "var(--sb-line)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          ink: "var(--brand-ink)",
          fill: "var(--brand-fill)",
          tint: "var(--brand-tint)",
        },
        // Status — health / lifecycle signal
        status: {
          ok: {
            DEFAULT: "var(--status-ok)",
            soft: "var(--status-ok-soft)",
            ink: "var(--status-ok-ink)",
          },
          info: {
            DEFAULT: "var(--status-info)",
            soft: "var(--status-info-soft)",
            ink: "var(--status-info-ink)",
          },
          warn: {
            DEFAULT: "var(--status-warn)",
            soft: "var(--status-warn-soft)",
            ink: "var(--status-warn-ink)",
          },
          error: {
            DEFAULT: "var(--status-error)",
            soft: "var(--status-error-soft)",
            ink: "var(--status-error-ink)",
          },
          neutral: {
            DEFAULT: "var(--status-neutral)",
            soft: "var(--status-neutral-soft)",
            ink: "var(--status-neutral-ink)",
          },
        },
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        lift: "var(--shadow-md)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
