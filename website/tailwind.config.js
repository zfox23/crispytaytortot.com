const defaultTheme = require('tailwindcss/defaultTheme');
const { rootCertificates } = require('tls');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s ease-in-out 1'
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
