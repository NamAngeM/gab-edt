import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--border-strong)",
        ring: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--text-primary)",
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172554',
          950: '#0b1329',
        },
        gabon: {
          green: '#009E60',
          yellow: '#FCD116',
          blue: '#3A75C4'
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--surface-container)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "var(--surface-container-low)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--primary-light)",
          foreground: "var(--primary)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        'glow': '0 20px 50px -12px rgba(37, 99, 235, 0.25)',
        'card': '0 25px 50px -12px rgba(15, 23, 42, 0.22)'
      }
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
