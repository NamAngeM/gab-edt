import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '!./src/**/__tests__/**',
    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.spec.{ts,tsx}',
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
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399",
          500: "#009E60", 600: "#007A4B", 700: "#00623C", 800: "#004D2F", 900: "#003A24", 950: "#00200F",
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
