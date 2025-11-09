// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#fbbf24',
          orange: '#f59e0b'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'spin-slow': 'spin 2s linear infinite',
      }
    },
  },
  plugins: [],
}