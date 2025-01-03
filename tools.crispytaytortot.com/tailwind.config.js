/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "../../crispytaytortot.com/website/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s ease-in-out 1'
      },
      fontFamily: {
        'sans': ['tilt-neon', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        spin: {
          '0%, ': {
            transform: 'rotate(0deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        }
      },
    },
  },
  darkMode: "class"
}
