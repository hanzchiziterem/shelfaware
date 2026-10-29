/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #f0fdf4)',
          100: 'var(--brand-100, #dcfce7)',
          500: 'var(--brand-500, #10b981)',
          600: 'var(--brand-600, #059669)',
          700: 'var(--brand-700, #047857)',
          DEFAULT: 'var(--brand-primary, #0f172a)',
        },
        sidebar: {
          bg: 'var(--sidebar-bg, #090d16)',
          hover: 'var(--sidebar-hover, #131b2e)',
          active: 'var(--sidebar-active, #1a243d)',
          border: 'var(--sidebar-border, #172138)',
          text: 'var(--sidebar-text, #94a3b8)',
          textActive: 'var(--sidebar-text-active, #f8fafc)',
        },
        surface: {
          DEFAULT: 'var(--surface-bg, #ffffff)',
          muted: 'var(--surface-muted, #f8fafc)',
          card: 'var(--surface-card, #ffffff)',
          border: 'var(--surface-border, #e2e8f0)',
        },
        content: {
          primary: 'var(--content-primary, #0f172a)',
          secondary: 'var(--content-secondary, #475569)',
          muted: 'var(--content-muted, #94a3b8)',
        },
      },
      fontFamily: {
        sans: ['var(--font-family, Inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        control: 'var(--radius-control, 0.375rem)',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        floating: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

