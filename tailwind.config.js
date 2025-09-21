// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        banana: {
          DEFAULT: "#F9D949",
          light: "#FFE872",
          dark: "#D8B520",
        },
        // Other color definitions...
      },
      // Other theme extensions...
    },
  },
  plugins: [require("tailwindcss-animate")],
}