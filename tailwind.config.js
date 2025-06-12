/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/views/**/*.{html,hbs}',
    './src/public/js/**/*.js',
    './src/modules/**/*.js'],
  theme: {
    extend: {
      colors: {
        midnightblue: '#145da0',
        darkblue: '#0c2d48',
        blue: '#2e8bc0',
        babyblue: '#b1d4e0',
      }
    },
  },
  plugins: [],
}

