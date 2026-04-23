/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#00A9F4',
          dark: '#0077B6',
          navy: '#0f172a',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f4f6f9',
          border: '#e8edf2',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          light: '#94a3b8',
        }
      },
      fontFamily: {
        logo: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
}
