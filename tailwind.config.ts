/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#000000", dark: "#E8ECF4" },
        surface: { DEFAULT: "#FFFFFF", dark: "#0E1420" },
        card: { DEFAULT: "#FFFFFF", dark: "#18202E" },
        signal: { DEFAULT: "#000000", amber: "#F5A100" },
        go: { DEFAULT: "#06C167", dark: "#34C07E" },
        warn: { DEFAULT: "#C77700" },
        alert: { DEFAULT: "#D64545" },
        mute: { DEFAULT: "#545454", dark: "#98A2B8" }
      },
      borderRadius: {
        sheet: "20px",
        card: "12px"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
