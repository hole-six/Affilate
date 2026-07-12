import type { Config } from "tailwindcss";

// Design tokens transcribed from design.md (Wise-inspired system).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9fe870",
          active: "#cdffad",
          neutral: "#c5edab",
          pale: "#e2f6d5",
        },
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#e8ebe6",
        },
        ink: {
          DEFAULT: "#0e0f0c",
          deep: "#163300",
        },
        body: "#454745",
        mute: "#868685",
        positive: {
          DEFAULT: "#2ead4b",
          deep: "#054d28",
        },
        warning: {
          DEFAULT: "#ffd11a",
          deep: "#b86700",
          content: "#4a3b1c",
        },
        negative: {
          DEFAULT: "#d03238",
          deep: "#a72027",
          darkest: "#a7000d",
          bg: "#320707",
        },
        accent: {
          orange: "#ffc091",
          cyan: "#38c8ff",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
    },
  },
  plugins: [],
};

export default config;
