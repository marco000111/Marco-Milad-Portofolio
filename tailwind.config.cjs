/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: '#050507',
        cyan: '#00f2fe',
        electric: '#4facfe',
        violet: '#a855f7',
        ink: '#f8fafc',
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 32px rgb(0 242 254 / 22%)',
      },
    },
  },
  plugins: [],
};
