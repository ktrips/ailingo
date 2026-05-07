/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        duo: {
          green:        '#58CC02',
          'green-dark': '#46A302',
          'green-light':'#D7FFB8',
          yellow:       '#FFD900',
          'yellow-dark':'#CE9B00',
          blue:         '#1CB0F6',
          'blue-dark':  '#0099D6',
          purple:       '#CE82FF',
          'purple-dark':'#9E52CF',
          red:          '#FF4B4B',
          'red-dark':   '#D92B2B',
          orange:       '#FF9600',
          'orange-dark':'#CF7000',
          bg:           '#F7F7F7',
          card:         '#FFFFFF',
          text:         '#3C3C3C',
          muted:        '#777777',
          light:        '#AFAFAF',
          border:       '#E5E5E5',
        },
        brand: {
          DEFAULT: '#58CC02',
          dark:    '#46A302',
          light:   '#D7FFB8',
        },
        gold:   '#FFD900',
        silver: '#9CA3AF',
        bronze: '#B45309',
        stage: {
          dojo:    '#58CC02',
          builder: '#1CB0F6',
          creator: '#CE82FF',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'duo': '0 4px 0 0',
        'duo-lg': '0 6px 0 0',
      },
      animation: {
        'bounce-in':  'bounceIn 0.5s ease-out',
        'pop':        'pop 0.3s ease-out',
        'wiggle':     'wiggle 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow':'bounce 2s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        bounceIn: {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.1)' },
          '70%':  { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-5deg)' },
          '50%':     { transform: 'rotate(5deg)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
