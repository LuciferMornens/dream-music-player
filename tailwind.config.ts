import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Unique neon-inspired primary colors
        primary: {
          50: '#eefbff',
          100: '#d7f2ff',
          200: '#b5e9ff',
          300: '#83ddff',
          400: '#48c7ff',
          500: '#1ea5ff',
          600: '#0687ff',
          700: '#0070eb',
          800: '#0859b7',
          900: '#0c4d8f',
          950: '#0c2f5a',
        },
        // Vibrant complementary accent colors
        accent: {
          50: '#fef1ff',
          100: '#fde6ff',
          200: '#fbccff',
          300: '#f9a0ff',
          400: '#f564ff',
          500: '#eb2dff',
          600: '#d812eb',
          700: '#b40cc1',
          800: '#940e9d',
          900: '#7b1080',
          950: '#4c0351',
        },
        // Neutral surface colors with a slight purple tint
        surface: {
          50: '#f8f7ff',
          100: '#f3f1ff',
          200: '#e9e6ff',
          300: '#d6d1ff',
          400: '#b3acff',
          500: '#8f85ff',
          600: '#6c61ff',
          700: '#4d40e3',
          800: '#3d33b8',
          900: '#2f2883',
          950: '#1a1657',
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'progress': 'progress 0.3s ease-out',
        'text-gradient': 'text-gradient 3s linear infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'loading-progress': 'loading-progress 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out forwards',
        'scale-up': 'scale-up 0.3s ease-out forwards',
        'rotate-gradient': 'rotate-gradient 3s linear infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'progress': {
          'from': { transform: 'scaleX(0)' },
          'to': { transform: 'scaleX(1)' },
        },
        'text-gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(1rem)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'loading-progress': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0) rotate(0deg)',
            filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1))',
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(2deg)',
            filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.2))',
          },
        },
        'glow': {
          '0%, 100%': { 
            filter: 'drop-shadow(0 0 15px rgba(30, 165, 255, 0.3))',
          },
          '50%': { 
            filter: 'drop-shadow(0 0 25px rgba(30, 165, 255, 0.6))',
          },
        },
        'slide-in': {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'scale-up': {
          '0%': { 
            transform: 'scale(0.8)',
            opacity: '0',
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'rotate-gradient': {
          '0%': { 
            transform: 'rotate(0deg)',
          },
          '100%': { 
            transform: 'rotate(360deg)',
          },
        },
        'wave': {
          '0%, 100%': { 
            transform: 'scaleY(1)',
          },
          '50%': { 
            transform: 'scaleY(0.5)',
          },
        },
        'bounce-subtle': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': { 
            transform: 'translateY(-15%)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(to right, var(--primary-600), var(--accent-600))',
        'gradient-neon': 'linear-gradient(45deg, #1ea5ff, #eb2dff)',
        'gradient-cosmic': 'linear-gradient(to right, #4d40e3, #eb2dff)',
        'gradient-aurora': 'linear-gradient(to right, #1ea5ff, #48c7ff, #eb2dff)',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
        'glow': 'filter, transform',
      },
      scale: {
        '102': '1.02',
      },
      boxShadow: {
        'player': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'hover': '0 12px 20px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(30, 165, 255, 0.4)',
        'glow-accent': '0 0 25px rgba(235, 45, 255, 0.4)',
        'neon': '0 0 30px rgba(30, 165, 255, 0.6), 0 0 60px rgba(30, 165, 255, 0.3)',
        'cosmic': '0 0 30px rgba(77, 64, 227, 0.6), 0 0 60px rgba(235, 45, 255, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
