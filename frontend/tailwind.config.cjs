/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(28px,-22px) scale(1.07)" },
          "66%": { transform: "translate(-18px,18px) scale(0.94)" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms ease-out both",
        float: "float 5s ease-in-out infinite",
        blob: "blob 11s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 18px 40px rgba(14, 116, 144, 0.35)",
      },
    },
  },
  plugins: [],
};
