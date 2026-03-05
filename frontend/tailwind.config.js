/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navyDark: '#0f172a',
        navyMid: '#1e293b',
        neonCyan: '#22d3ee',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.35)',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,211,238,0.4), 0 0 60px rgba(34,211,238,0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(34,211,238,0.8), 0 0 80px rgba(34,211,238,0.35)' },
        },
        speakingPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        thinkingDots: {
          '0%': { opacity: '0.2' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glowPulse: 'glowPulse 2.2s ease-in-out infinite',
        speakingPulse: 'speakingPulse 1.6s ease-in-out infinite',
        thinkingDots: 'thinkingDots 1.2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.25s ease-out both',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
