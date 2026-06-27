/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07090f',
          900: '#0b0e18',
          800: '#111827',
          700: '#162033',
          600: '#1c2a44',
          500: '#243558',
        },
        gold: {
          300: '#f5d060',
          400: '#e8b830',
          500: '#d4a020',
          600: '#b88810',
          700: '#9c7008',
        },
        brand: {
          blue: '#1a4080',
          'blue-mid': '#2060b0',
          silver: '#8ca0b0',
        },
      },
    },
  },
  plugins: [],
}
