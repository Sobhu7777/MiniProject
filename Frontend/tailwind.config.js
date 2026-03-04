/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59afff',
          500: '#338bff',
          600: '#1a6bf5',
          700: '#1355e1',
          800: '#1645b6',
          900: '#183d8f',
          950: '#132757',
        },
        risk: {
          low:    '#22c55e',
          medium: '#eab308',
          high:   '#ef4444',
        },
        surface: {
          DEFAULT: '#0f172a',
          card:    '#1e293b',
          hover:   '#334155',
          border:  '#475569',
        },
      },
    },
  },
  plugins: [],
}
