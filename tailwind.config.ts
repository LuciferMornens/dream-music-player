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
        // Elegant ocean-inspired primary colors
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Warm gold accent colors
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Deep ocean surface colors
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
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
        'music-pulse': 'music-pulse 0.8s ease-in-out infinite',
        'bass-thump': 'bass-thump 1.2s ease-in-out infinite',
        'beat-bounce': 'beat-bounce 0.6s ease-in-out infinite',
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
        'gradient-ocean': 'linear-gradient(45deg, #14b8a6, #f59e0b)',
        'gradient-depth': 'linear-gradient(135deg, #0d9488, #d97706, #0f766e)',
        'gradient-coral': 'linear-gradient(to right, #2dd4bf, #fbbf24)',
        'gradient-abyss': 'linear-gradient(180deg, #042f2e, #134e4a, #0f172a)',
        'gradient-shimmer': 'linear-gradient(45deg, #5eead4, #fcd34d, #2dd4bf)',
        'gradient-treasure': 'linear-gradient(90deg, #0f766e, #f59e0b, #14b8a6)',
        'gradient-aurora': 'linear-gradient(45deg, #2dd4bf, #99f6e4, #fbbf24)',
        'gradient-deep': 'linear-gradient(to bottom, #042f2e, #0f172a)',
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
        'glow': '0 0 20px rgba(20, 184, 166, 0.4)',
        'glow-ocean': '0 0 25px rgba(20, 184, 166, 0.4)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.4)',
        'glow-coral': '0 0 25px rgba(45, 212, 191, 0.4)',
        'ocean-glow': '0 0 30px rgba(20, 184, 166, 0.6), 0 0 60px rgba(20, 184, 166, 0.3)',
        'coral-glow': '0 0 30px rgba(45, 212, 191, 0.6), 0 0 60px rgba(251, 191, 36, 0.3)',
        'treasure-glow': '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(13, 148, 136, 0.2)',
        'depth-glow': '0 0 50px rgba(13, 148, 136, 0.4), 0 0 100px rgba(4, 47, 46, 0.3)',
        'shimmer-glow': '0 0 35px rgba(94, 234, 212, 0.5), 0 0 70px rgba(252, 211, 77, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
