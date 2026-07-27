/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFDF9",
        chocolate: "#2D221E",
        accent: "#E07A5F",
        amber: "#F4A261",
        cream: "#FFFDF9",
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        serif: ["Playfair Display", "Fraunces", "serif"],
      },
    },
  },
  plugins: [],
}
