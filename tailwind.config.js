/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 300: '#e5c27b', 400: '#d8ad5f', 500: '#bd9149' },
      },
    },
  },
  plugins: [],
};
