import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F6E4F",
          hover: "#0B5A3F",
          dark: "#34C77E",
          darkHover: "#2AB06B",
        },
        secondary: {
          DEFAULT: "#B5762A",
          dark: "#D98F3F",
        },
        bg: {
          DEFAULT: "#FAFAF7",
          dark: "#14161A",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1D2025",
          raised: "#FFFFFF",
          raisedDark: "#24272D",
        },
        border: {
          DEFAULT: "#E4E2DB",
          dark: "#2E323A",
        },
        text: {
          primary: "#1A1D1F",
          primaryDark: "#F2F1EC",
          secondary: "#5C6166",
          secondaryDark: "#A7ACB2",
        },
        success: { DEFAULT: "#1E9E5A", dark: "#34C77E" },
        warning: { DEFAULT: "#C77E1E", dark: "#E0A23D" },
        danger: { DEFAULT: "#C4432B", dark: "#E2604A" },
        info: { DEFAULT: "#2470B8", dark: "#5DA1E0" },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
