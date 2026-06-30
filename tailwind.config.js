/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#4f7df3',
          600: '#3d6ee8',
          700: '#2d5cd4',
          900: '#1a3a8f',
        },
        surface: '#0f1117',
        card: '#181c27',
        border: '#252a38',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
