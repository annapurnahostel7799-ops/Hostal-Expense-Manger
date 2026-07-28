import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 60px rgba(99, 102, 241, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(79, 70, 229, 0.3), transparent 28%), radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.18), transparent 25%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
