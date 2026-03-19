/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0073E6",
          soft: "#3396EC",
          deep: "#005BB5",
        },
        secondary: {
          DEFAULT: "#111827",
          soft: "#1F2937",
          deep: "#0F172A",
        },
        success: {
          DEFAULT: "#16A34A",
          soft: "#22C55E",
          deep: "#16A34A",
        },
        warning: {
          DEFAULT: "#F59E0B",
          soft: "#FBBF24",
          deep: "#D97706",
        },
        danger: {
          DEFAULT: "#DC2626",
          soft: "#EF4444",
          deep: "#DC2626",
        },
        background: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          muted: "#F1F5F9",
        },
        border: {
          DEFAULT: "#E2E8F0",
          light: "#F1F5F9",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          disabled: "#94A3B8",
        },
        difficulty: {
          easy: "#22C55E",
          medium: "#F59E0B",
          hard: "#EF4444",
        },
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(90deg, #0073E6 0%, #005BB5 100%)",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.04)",
        focus: "0 0 0 3px rgba(99,102,241,0.25)",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
