/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff8c00', // Deep Orange
          dark: '#cc7000',
          light: '#ffb366',
        },
        secondary: {
          DEFAULT: '#ffbf00', // Amber
          dark: '#cc9900',
        },
        tertiary: {
          DEFAULT: '#1b6d24', // Green for Credit
          dark: '#114a17',
        },
        background: '#f9f9f9', // Off-white
        'on-background': '#1a1c1c', // Near-black
        'on-surface-variant': '#564334', // Warm brown
        surface: {
          container: '#eeeeee',
          'container-low': '#f3f3f3',
          'container-lowest': '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem', // 24px corner radius for container wrappers & main buttons
      },
      spacing: {
        '20px': '20px',
      }
    },
  },
  plugins: [],
}
