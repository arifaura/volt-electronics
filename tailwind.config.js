/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': 'var(--background)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'border': 'var(--border)',
        'card-bg': 'var(--card-bg)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'header-bg': 'var(--header-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
      },
    },
  },
  plugins: [],
}

