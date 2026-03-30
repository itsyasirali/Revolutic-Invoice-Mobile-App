/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan files for classNames
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#0891B2',
        secondary: '#FF9608',
        background: '#E4EEF0',
      },
      fontFamily: {
        sans: ['Roboto_400Regular'],
      },
    },
  },
  plugins: [],
}
