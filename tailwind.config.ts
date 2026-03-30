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
        "cosmic-blue": "#0A192F",
        "cosmic-dark": "#020617",
        "ivory-white": "#FDFDFD",
        "radiant-amber": "#FFBF00",
        "off-white": "#F8F9FA",
        "navy-dark": "#0B1320",
        "accent-gold": "#D4AF37",
      },
      boxShadow: {
        "anti-gravity": "0 20px 40px -10px rgba(11, 19, 32, 0.08)",
        "soft": "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        "orb-float": "orb-float 20s ease-in-out infinite",
        "title-reveal": "title-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "orb-float": {
          "0%, 100%": { transform: "translateY(0) scale(1) rotate(0deg)", filter: "blur(60px)" },
          "33%": { transform: "translateY(-50px) scale(1.1) rotate(5deg)", filter: "blur(80px)" },
          "66%": { transform: "translateY(20px) scale(0.9) rotate(-5deg)", filter: "blur(40px)" },
        },
        "title-reveal": {
          "0%": { opacity: "0", transform: "translateY(40px) scale(0.95)", filter: "blur(10px)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
