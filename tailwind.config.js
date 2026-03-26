/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        accent: '#8b5cf6',
        background: {
          primary: '#0a0a1a',
          secondary: '#12122a',
          card: '#16163a',
          sidebar: '#0f0f25',
        },
        border: '#2a2a5a',
      },
    },
  },
  plugins: [],
}
