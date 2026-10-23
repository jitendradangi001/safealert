/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        emergency: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          dark: '#991b1b',
        },
        safe: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
        },
        warn: {
          DEFAULT: '#ea580c',
          light: '#f97316',
        },
        dash: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
