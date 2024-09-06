const colors = require('material-ui-colors')

/**
 * @param {T} color
 * @returns T & {
 *   main: string
 *   light: string
 *   dark: string
 * }
 */
function semantic(color) {
  return {
    ...color,
    light: color[600],
    main: color[700],
    dark: color[800],
  }
}

const semanticColors = Object.fromEntries(
  Object.entries({
    ...colors,
    primary: colors.blue,
    error: colors.red,
    warn: colors.orange,
  }).map(([key, value]) => [key, semantic(value)])
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      zIndex: {
        header: 1000,
        infinity: 9999,
      },
      screens: {
        tablet: '640px', // => @media (min-width: 640px) { ... }
        desktop: '1024px', // => @media (min-width: 1024px) { ... }
      },
      colors: semanticColors,
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
}
