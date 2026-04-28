/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"Didot"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
      },
      colors: {
        ink:   '#0a0a0a',
        stone: '#f5f4f2',
        mist:  '#e8e6e1',
        ash:   '#9e9b97',
        chalk: '#fafaf9',
      },
      letterSpacing: {
        widest2: '0.35em',
        widest3: '0.5em',
      },
      transitionDuration: {
        800:  '800ms',
        1200: '1200ms',
      },
      gridTemplateColumns: {
        editorial: '1fr 1fr',
      },
    },
  },
  plugins: [],
}
