import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iseul: {
          paper: "#FAF8F4",
          paper2: "#F2EEE7",
          card: "#FFFFFF",
          ink: "#1C1A16",
          muted: "#6E675C",
          line: "#E4DED4",
          accent: "#3F5C4E",
          accent2: "#8FA89A",
          dew: "#E6EFE9",
          sale: "#9A3F32",
          gold: "#C9A227",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
      },
      borderRadius: {
        iseul: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,26,22,.04), 0 8px 30px rgba(28,26,22,.06)",
      },
      maxWidth: {
        store: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
