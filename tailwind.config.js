/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)'
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)'
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        // District theme colors for public pages
        district: {
          red: '#B91C1C',
          'red-light': '#FEE2E2',
          blue: '#2563EB',
          'blue-light': '#DBEAFE',
          green: '#059669',
          'green-light': '#D1FAE5',
          amber: '#D97706',
          'amber-light': '#FEF3C7',
        },
        // StrataDASH brand colors
        brand: {
          bg: '#0b0b12',
          ink: '#061427',
          navy: '#0B1F3A',
          slate: '#0F172A',      // Dark slate for sidebar
          deepTeal: '#1A6F73',
          teal: '#22B8AE',
          mint: '#36D7C3',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [],
}