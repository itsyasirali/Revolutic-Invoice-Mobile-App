/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan files for classNames
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1AA3FF",
          light: "#1AA3FF",
        },
        secondary: {
          DEFAULT: "#E07800",
          dark: "#A85C00",
        },
        background: "#F9FAFB",
      },
      fontFamily: {
        sans: ["Roboto_400Regular"],
      },
    },
  },
  plugins: [],
};
