import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // Brand palette
        brand: {
          blue:    '#2563eb',
          indigo:  '#4f46e5',
          violet:  '#7c3aed',
          emerald: '#059669',
          amber:   '#d97706',
          rose:    '#e11d48',
          cyan:    '#0891b2',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -4px rgba(99, 102, 241, 0.4)',
        'glow-blue':   '0 0 20px -4px rgba(59, 130, 246, 0.4)',
        'glow-emerald':'0 0 20px -4px rgba(16, 185, 129, 0.4)',
        'card':        '0 4px 24px -4px rgba(79, 70, 229, 0.12)',
        'card-hover':  '0 8px 32px -4px rgba(79, 70, 229, 0.18)',
        'sidebar':     '4px 0 24px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh-dark': 'radial-gradient(at 20% 0%, rgba(37,99,235,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.06) 0px, transparent 50%)',
      },
      animation: {
        'shimmer':      'shimmer 2s infinite linear',
        'float':        'float 3s ease-in-out infinite',
        'pulse-glow':   'pulse-glow 2s ease-in-out infinite',
        'slide-in-up':  'slide-in-up 0.4s ease-out',
        'scale-in':     'scale-in 0.3s ease-out',
        'fade-in':      'fade-in 0.3s ease-out',
        'bounce-soft':  'bounce-soft 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
          '50%':      { boxShadow: '0 0 20px 10px rgba(99, 102, 241, 0)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
          '50%':      { transform: 'none',            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
