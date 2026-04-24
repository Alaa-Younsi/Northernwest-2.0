import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#0d0d0d',
        border: '#1a1a1a',
        red: {
          DEFAULT: '#FF0000',
          dim: '#cc0000',
        },
        gray: {
          DEFAULT: '#888888',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(255,0,0,0.18)',
        'glow-red-lg': '0 0 40px rgba(255,0,0,0.25)',
        'glow-white': '0 0 20px rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'marquee': 'marquee 20s linear infinite',
        'marquee-reverse': 'marquee-reverse 20s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
        'glitch': 'glitch 3s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-red': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,0,0,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,0,0,0.8)' },
        },
        glitch: {
          '0%, 95%, 100%': { transform: 'translate(0)' },
          '96%': { transform: 'translate(-2px, 1px)' },
          '97%': { transform: 'translate(2px, -1px)' },
          '98%': { transform: 'translate(-1px, 2px)' },
          '99%': { transform: 'translate(1px, -2px)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100vh' },
        },
      },
    },
  },
  plugins: [],
}

export default config
