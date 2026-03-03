/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app': '#0a0e27',
        'surface-start': '#161b3d',
        'surface-end': '#0f1330',
        'accent-red': '#FF6B6B',
        'accent-yellow': '#FFD93D',
        'accent-teal': '#4ECDC4',
        'accent-green': '#4CAF50',
        'text-primary': '#ffffff',
        'text-muted': '#a0a8d0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(76, 175, 80, 0.4)',
        'glow-red': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glow-teal': '0 0 20px rgba(78, 205, 196, 0.3)',
        'glow-yellow': '0 0 20px rgba(255, 217, 61, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
