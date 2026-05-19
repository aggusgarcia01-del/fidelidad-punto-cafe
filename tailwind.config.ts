import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F6F1EB",
        espresso: "#2B1810",
        caramel: "#b5a48c",
        oat: "#E8D9C9",
        porcelain: "#FFFDFC",
      },
      boxShadow: {
        soft: "0 22px 80px rgba(43, 24, 16, 0.10)",
        lift: "0 16px 36px rgba(43, 24, 16, 0.14)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
