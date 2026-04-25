// /Users/parthkaran/Documents/claude_projects/liquidswap/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1a1a2a',
        card: 'rgba(255,255,255,0.55)',
        border: '#e2e8f0',
        primary: '#22c55e',
        'primary-dark': '#16a34a',
        accent: '#16a34a',
        success: '#16a34a',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#94a3b8',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
