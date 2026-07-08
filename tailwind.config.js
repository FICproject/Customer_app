/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#F4C400',
          light: '#FFE47E',
          dark: '#B89200',
        },
        navy: {
          DEFAULT: '#050B1E',
          light: '#0D1636',
          dark: '#02050D',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.12)',
        }
      },
      fontFamily: {
        sans: ['System'],
      }
    },
  },
  plugins: [],
}
