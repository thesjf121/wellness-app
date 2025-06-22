/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        wellness: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Calm-inspired color palette
        ocean: {
          50: '#E6F0FF',
          100: '#CCE1FF',
          200: '#99C3FF',
          300: '#66A5FF',
          400: '#3387FF',
          500: '#1E3A5F',
          600: '#1A3354',
          700: '#152B49',
          800: '#11243E',
          900: '#0A0E27'
        },
        sage: {
          50: '#E8F5F0',
          100: '#D1EBE1',
          200: '#A3D7C3',
          300: '#96CEB4',
          400: '#75C3A5',
          500: '#54B896',
          600: '#439378',
          700: '#326E5A',
          800: '#21493C',
          900: '#11241E'
        },
        lavender: {
          50: '#F0F0FF',
          100: '#E1E1FF',
          200: '#C3C3FF',
          300: '#A5A5FF',
          400: '#8787FF',
          500: '#7C83FD',
          600: '#6A70E0',
          700: '#585DC3',
          800: '#464AA6',
          900: '#343789'
        },
        // Headspace-inspired accent colors
        energetic: {
          50: '#FEF3E8',
          100: '#FDE7D1',
          200: '#FBCFA3',
          300: '#F9B775',
          400: '#F79F47',
          500: '#F6893D',
          600: '#E47A2E',
          700: '#D26B1F',
          800: '#C05C10',
          900: '#AE4D01'
        },
        sunny: {
          50: '#FFFEF0',
          100: '#FFFDE1',
          200: '#FFFBC3',
          300: '#FFF9A5',
          400: '#FFF787',
          500: '#FFC93C',
          600: '#E6B535',
          700: '#CCA12E',
          800: '#B38D27',
          900: '#997920'
        },
        coral: {
          50: '#FFF0F0',
          100: '#FFE1E1',
          200: '#FFC3C3',
          300: '#FFA5A5',
          400: '#FF8787',
          500: '#FF6B6B',
          600: '#E66060',
          700: '#CC5555',
          800: '#B34A4A',
          900: '#993F3F'
        }
      },
      fontFamily: {
        'primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'secondary': ['Georgia', 'serif']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      backdropBlur: {
        'xs': '2px'
      }
    },
  },
  plugins: [],
}