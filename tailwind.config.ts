import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: "#F6F1EB",
        espresso: "#2B1810",
        caramel: "#b5a48c",
        oat: "#E8D9C9",
        porcelain: "#FFFDFC",
        brand: {
          black: '#121212',
          dark: '#1a1a1a',
          gray: '#2a2a2a',
          light: '#f5f5f5',
          accent: '#d4af37',
        },
        
        "surface-variant": "#e2e2e2",
        "on-primary-container": "#858383",
        "surface-container-high": "#e8e8e8",
        "secondary-container": "#f3e0c5",
        "background": "#f9f9f9",
        "on-secondary-container": "#70624d",
        "surface-container-low": "#f3f3f4",
        "on-secondary-fixed-variant": "#514532",
        "surface": "#f9f9f9",
        "inverse-primary": "#c8c6c5",
        "inverse-on-surface": "#f0f1f1",
        "on-primary-fixed": "#1c1b1b",
        "tertiary-fixed": "#e4e2dc",
        "on-error-container": "#93000a",
        "on-surface": "#1a1c1c",
        "surface-bright": "#f9f9f9",
        "primary-fixed-dim": "#c8c6c5",
        "on-tertiary-fixed-variant": "#474742",
        "on-secondary": "#ffffff",
        "on-primary-fixed-variant": "#474746",
        "on-error": "#ffffff",
        "tertiary": "#000000",
        "primary-fixed": "#e5e2e1",
        "outline": "#747878",
        "on-tertiary": "#ffffff",
        "secondary": "#6a5c48",
        "error-container": "#ffdad6",
        "primary-container": "#1c1b1b",
        "on-tertiary-container": "#85847e",
        "secondary-fixed-dim": "#d6c4ab",
        "tertiary-fixed-dim": "#c8c6c0",
        "surface-container-highest": "#e2e2e2",
        "error": "#ba1a1a",
        "surface-tint": "#5f5e5e",
        "surface-container": "#eeeeee",
        "on-surface-variant": "#444748",
        "outline-variant": "#c4c7c7",
        "tertiary-container": "#1b1c18",
        "surface-container-lowest": "#ffffff",
        "inverse-surface": "#2f3131",
        "primary": "#000000",
        "surface-dim": "#dadada",
        "on-tertiary-fixed": "#1b1c18",
        "secondary-fixed": "#f3e0c5",
        "on-primary": "#ffffff",
        "on-background": "#1a1c1c",
        "on-secondary-fixed": "#241a0a"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "section-gap": "80px",
        "gutter": "24px",
        "container-padding-mobile": "20px",
        "unit": "8px",
        "container-padding-desktop": "48px"
      },
      fontFamily: {
        "headline-lg-mobile": ["var(--font-plus-jakarta)", "sans-serif"],
        "body-md": ["var(--font-hanken)", "sans-serif"],
        "label-sm": ["var(--font-hanken)", "sans-serif"],
        "display-lg": ["var(--font-plus-jakarta)", "sans-serif"],
        "label-md": ["var(--font-hanken)", "sans-serif"],
        "headline-lg": ["var(--font-plus-jakarta)", "sans-serif"],
        "headline-md": ["var(--font-plus-jakarta)", "sans-serif"],
        "body-lg": ["var(--font-hanken)", "sans-serif"],
        sans: ["var(--font-hanken)", "sans-serif"]
      },
      fontSize: {
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }]
      },
      backgroundImage: {
        'premium-gradient': 'radial-gradient(circle at top center, rgba(212, 175, 55, 0.15), transparent 40%), linear-gradient(to bottom, #121212, #0a0a0a)',
      },
      keyframes: {
        'stamp-fill': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.95)', filter: 'brightness(0.8)' },
          '15%, 85%': { opacity: '1', transform: 'scale(1.1)', filter: 'brightness(1.2)' },
          '25%, 75%': { opacity: '1', transform: 'scale(1)', filter: 'brightness(1)' },
        }
      },
      animation: {
        'stamp-fill': 'stamp-fill 4s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};

export default config;
