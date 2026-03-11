/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        golf: {
          green: '#2d5016',
          light: '#4a7c2e',
          dark: '#1a3009',
        },
      },
    },
  },
  plugins: [],
}
