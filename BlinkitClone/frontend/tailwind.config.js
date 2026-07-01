/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blinkit: {
          yellow: '#F7EC13',
          green: '#0C831F',
          dark: '#1C1C1C',
          lightGreen: '#EBF7EE',
          lightGray: '#F5F5F5',
          border: '#E8E8E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
