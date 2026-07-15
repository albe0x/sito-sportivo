/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0a0a12",
        cardBg: "rgba(20, 20, 35, 0.6)",
        cardHover: "rgba(30, 30, 55, 0.85)",
        football: "#10b981",
        tennis: "#a3e635",
        "beach-volley": "#f97316",
        basketball: "#60a5fa",
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        "football-glow": "0 0 20px rgba(16, 185, 129, 0.4)",
        "tennis-glow": "0 0 20px rgba(132, 204, 22, 0.4)",
        "beach-volley-glow": "0 0 20px rgba(249, 115, 22, 0.4)",
        "basketball-glow": "0 0 20px rgba(96, 165, 250, 0.4)",
        "accent-glow": "0 0 20px rgba(139, 92, 246, 0.4)",
      }
    },
  },
  plugins: [],
}
