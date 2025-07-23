/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          500: '#00A651',
          600: '#009245',
          700: '#008039',
        },
      },
    },
  },
  plugins: [],
}
