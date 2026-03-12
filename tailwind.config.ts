import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],

  // Dark mode via data attribute, not class
  darkMode: ["selector", '[data-theme="dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Lato", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Lora", "Georgia", "'Times New Roman'", "serif"],
        mono: ["JetBrains Mono", "'Fira Code'", "'Courier New'", "monospace"],
      },

      colors: {
        // These mirror the CSS custom properties in DESIGN_SYSTEM.md.
        // Use the CSS variables directly in components for theme-switching;
        // these Tailwind values are for static/non-themed contexts only.
        canvas: "#faf8f5",
        surface: "#f2ede6",
        overlay: "#eee8de",

        accent: {
          DEFAULT: "#7c5c3e",
          light: "#a07850",
          subtle: "#e8ddd0",
        },

        text: {
          primary: "#2c2520",
          secondary: "#5c5048",
          muted: "#8c8078",
          disabled: "#b8b0a8",
        },

        border: {
          subtle: "#e0d8ce",
          DEFAULT: "#ccc4b8",
          strong: "#a89c90",
        },

        success: "#4a7c59",
        warning: "#9c7a2e",
        error: "#9c3e3e",
        info: "#3e6b9c",
      },

      borderRadius: {
        // Hard cap at 6px per design system
        DEFAULT: "4px",
        sm: "3px",
        md: "4px",
        lg: "6px",
      },

      fontSize: {
        xs: ["11px", { lineHeight: "1.4" }],
        sm: ["13px", { lineHeight: "1.4" }],
        base: ["15px", { lineHeight: "1.4" }],
        lg: ["17px", { lineHeight: "1.4" }],
        xl: ["20px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.4" }],
        "3xl": ["30px", { lineHeight: "1.4" }],
      },

      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
      },

      maxWidth: {
        canvas: "680px",
      },

      transitionDuration: {
        DEFAULT: "150ms",
        panel: "200ms",
      },
    },
  },

  plugins: [],
} satisfies Config;
