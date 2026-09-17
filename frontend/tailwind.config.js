/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#F4F7FE',
        'brand-card': '#FFFFFF',
        'brand-main': '#1E293B',
        'brand-muted': '#64748B',
        'brand-primary': '#4AA3FF',
        'brand-cyan': '#5CE1E6',
        'brand-purple': '#5500FF',
      },
      borderRadius: {
        'xl': '20px',
      }
    },
  },
  plugins: [],
}
