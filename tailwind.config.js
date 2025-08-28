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
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
          800: '#0b5394',
          900: '#0d47a1',
        },
        accent: {
          400: '#26c6da',
          500: '#00acc1',
          600: '#00838f',
        },
        success: {
          50: '#e8f5e8',
          500: '#4caf50',
        },
        warning: {
          50: '#fff3e0',
          500: '#ff9800',
        },
        error: {
          50: '#ffebee',
          500: '#f44336',
        },
        surface: '#f5f7fa',
        background: '#fafbfc',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}