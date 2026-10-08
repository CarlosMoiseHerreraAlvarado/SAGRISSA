/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          soft: 'rgb(var(--color-surface-soft) / <alpha-value>)',
          border: 'rgb(var(--color-surface-border) / <alpha-value>)',
          dark: '#0b1120',
          'dark-soft': '#1e293b',
          'dark-border': '#334155',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          muted: 'rgb(var(--color-ink-muted) / <alpha-value>)',
          light: 'rgb(var(--color-ink-light) / <alpha-value>)',
          dark: '#f8fafc',
          'dark-muted': '#94a3b8',
        }
      },
      fontFamily: {
        logo: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.25)',
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
