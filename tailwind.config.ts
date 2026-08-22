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
          areia: "#F0EAE0",
          card: "#FAF8F4",
          ink: "#1C1A16",
          muted: "#6E675C",
          line: "#E2DBD0",
          pine: "#375145",
          sage: "#8FA89A",
          accent: "#375145",
          accent2: "#8FA89A",
          dew: "#E4EFE9",
          grafite: "#4A453D",
          sobre: "#EDE7DD",
          sale: "#9A3F32",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
      },
      maxWidth: {
        store: "960px",
      },
    },
  },
  plugins: [],
};

export default config;
