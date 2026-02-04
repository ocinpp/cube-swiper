/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          void: '#0a0a0c',
          obsidian: '#121216',
          charcoal: '#1a1a20',
          amber: '#ff9500',
          'amber-glow': '#ffb340',
          cyan: '#00d4ff',
          'cyan-dim': '#0088aa',
          white: '#f5f5f7',
          gray: '#8a8a93',
          'gray-dim': '#4a4a52',
        },
      },
    },
  },
  plugins: [],
}
