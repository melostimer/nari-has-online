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
        // Nar-ı Has brand palette — deep reds, warm ambers, dark backgrounds
        brand: {
          50:  "#fff5f0",
          100: "#ffe9de",
          200: "#ffcfb8",
          300: "#ffaa84",
          400: "#ff7a4e",
          500: "#ff5722",
          600: "#e63d0a",
          700: "#c12e07",
          800: "#9e270b",
          900: "#82230e",
          950: "#46100a",
        },
        pomegranate: {
          50:  "#fef2f2",
          100: "#fde8e8",
          200: "#fccaca",
          300: "#fa9898",
          400: "#f55a5a",
          500: "#ea2b2b",
          600: "#d41515",
          700: "#b21111",
          800: "#941212",
          900: "#7b1515",
          950: "#430707",
        },
        dark: {
          50:  "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in-right": "slideInRight 0.3s ease-in-out",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "bounce-soft": "bounceSoft 0.5s ease-in-out",
        "pulse-soft": "pulseSoft 2s infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "blob": "blob 7s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.16)",
        "glow": "0 0 30px rgba(255, 87, 34, 0.3)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1a0a08 0%, #3d1a14 50%, #1a0a08 100%)",
        "card-gradient": "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)",
        "brand-gradient": "linear-gradient(135deg, #ff5722 0%, #b21111 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
