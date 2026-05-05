import type { Config } from 'tailwindcss';

export default {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './styles/**/*.{css}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
