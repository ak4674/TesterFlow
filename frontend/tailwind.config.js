/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Devanagari", "sans-serif"],
      },
      colors: {
        hindi: "#1d6fa4",
        english: "#1a1a1a",
        brand: { DEFAULT: "#6c47ff", light: "#ede9ff" },
      },
    },
  },
  plugins: [],
};
