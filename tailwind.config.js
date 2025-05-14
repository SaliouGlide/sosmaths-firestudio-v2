/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand color (pink/orange gradient - using #EF878D for utility classes)
        primary: {
          50: '#FEF3F3',
          100: '#FDE7E8',
          200: '#FBD2D5',
          300: '#F8BDC1',
          400: '#F6A8AE',
          500: '#EF878D', // Base primary color
          600: '#DA7A7E',
          700: '#C46D70',
          800: '#AF6063',
          900: '#995355',
        },
        // Secondary color (dark blue)
        secondary: {
 'dark-blue': '#231F52',
        },
        // Color for less important UI elements (soft pink)
 softPink: '#E59595',
        // Semantic colors
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};