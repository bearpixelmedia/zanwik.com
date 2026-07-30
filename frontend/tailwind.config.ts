import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0a7e3e', 50: '#e8f5e9', 100: '#c8e6c9', 200: '#a5d6a7', 300: '#81c784', 400: '#66bb6a', 500: '#4caf50', 600: '#43a047', 700: '#388e3c', 800: '#2e7d32', 900: '#1b5e20' },
        accent: { DEFAULT: '#ff6b35', 50: '#fff3e0', 100: '#ffe0b2', 200: '#ffcc80', 300: '#ffb74d', 400: '#ffa726', 500: '#ff9800', 600: '#fb8c00', 700: '#f57c00', 800: '#ef6c00', 900: '#e65100' }
      }
    }
  },
  plugins: []
}
export default config
