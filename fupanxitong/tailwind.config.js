/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d3dae5',
          300: '#afbccf',
          400: '#8599b5',
          500: '#667b9d',
          600: '#526283',
          700: '#44516a',
          800: '#3b4559',
          900: '#343c4c',
        }
      }
    },
  },
  plugins: [],
}
