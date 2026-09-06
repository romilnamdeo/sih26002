/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#2d6a4f',
          DEFAULT: '#1B4332',
          dark: '#081c15',
        },
        accent: {
          light: '#f4a261',
          DEFAULT: '#E76F51',
          dark: '#d05f41',
        },
        risk: {
          green: '#40916C',
          yellow: '#E9A93B',
          red: '#E63946',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
