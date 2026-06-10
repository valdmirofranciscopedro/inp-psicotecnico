/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        inp: {
          navy:    '#0F2D5A',
          navyDk:  '#0a2247',
          blue:    '#185FA5',
          blueLt:  '#E6F1FB',
          green:   '#1D9E75',
          greenLt: '#E1F5EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
