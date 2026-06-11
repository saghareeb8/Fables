import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          50: "#e6e9ff",
          100: "#c4caff",
          200: "#9aa4ff",
          300: "#6f7dff",
          400: "#4f5ce0",
          500: "#3a3fad",
          600: "#2a2c7d",
          700: "#1d1e57",
          800: "#131339",
          900: "#0b0b24",
          950: "#06061a",
        },
        moon: {
          glow: "#fef3c7",
          soft: "#fde68a",
        },
        star: "#dbeafe",
      },
      fontFamily: {
        display: ["Baloo 2", "Quicksand", "ui-rounded", "system-ui", "sans-serif"],
        body: ["Quicksand", "ui-rounded", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 138, 255, 0.35)",
        "glow-sm": "0 0 18px rgba(124, 138, 255, 0.3)",
        moon: "0 0 60px 10px rgba(254, 243, 199, 0.45)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Open-book leaf turn: a half-page leaf pivots on the center spine
        // through a full 180°. "left" sweeps to the left, "right" to the right.
        "leaf-flip-left": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(-180deg)" },
        },
        "leaf-flip-right": {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(180deg)" },
        },
      },
      animation: {
        twinkle: "twinkle 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "spin-slow": "spin-slow 8s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "leaf-flip-left":
          "leaf-flip-left 0.8s cubic-bezier(0.36, 0.1, 0.3, 1) both",
        "leaf-flip-right":
          "leaf-flip-right 0.8s cubic-bezier(0.36, 0.1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
