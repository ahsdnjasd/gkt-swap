// /Users/parthkaran/Documents/claude_projects/liquidswap/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#04040a',
        foreground: '#f8fafc',
        card: '#0d0d1a',
        border: '#1a1a2e',
        cyan: '#00d4ff',
        violet: '#7c3aed',
        success: '#00ff88',
        danger: '#ff3366',
        warning: '#f59e0b',
        muted: '#64748b',
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
