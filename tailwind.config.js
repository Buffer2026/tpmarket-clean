/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#050B14',
        lemon: '#CCFF00',
        purple: '#8B5CF6',
        yellow: '#FACC15',
        slate: '#94A3B8',
        sky: '#87CEEB',
        cyanlight: '#E0F7FA',
        darkcard: '#0F172A',
      },
    },
  },
  plugins: [],
}
