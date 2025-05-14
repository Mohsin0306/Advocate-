/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7e6',
          100: '#cef0cd',
          200: '#a3e1a2',
          300: '#77d177',
          400: '#4cc24c',
          500: '#2db42c',
          600: '#049e00',
          700: '#038700',
          800: '#027000',
          900: '#025800',
          950: '#014000',
        },
      },
    },
  },
  plugins: [],
}